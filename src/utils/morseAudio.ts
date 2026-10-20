/**
 * Web Audio API Engine for CW (Continuous Wave) Morse Code Audio & Beacon Synthesis.
 * Follows the standard PARIS Morse timing convention with customizable WPM & frequency.
 */

export interface PlaybackProgress {
  charIndex: number;
  symbolIndex: number; // index within the character's morse string
  activeSymbol: '.' | '-' | '/' | ' ';
  isSounding: boolean;
  isComplete: boolean;
}

export class MorseAudioEngine {
  private ctx: AudioContext | null = null;
  private continuousOsc: OscillatorNode | null = null;
  private continuousGain: GainNode | null = null;
  private isPlayingSequence = false;
  private abortController: AbortController | null = null;

  // Audio parameters
  private frequency = 700; // Hz (typical radio telegraph sidetone 550 - 800 Hz)
  private wpm = 18; // Words per minute
  private volume = 0.6; // 0 to 1

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setFrequency(freq: number) {
    this.frequency = Math.max(300, Math.min(1200, freq));
    if (this.continuousOsc) {
      this.continuousOsc.frequency.setValueAtTime(this.frequency, this.getAudioContext().currentTime);
    }
  }

  public getFrequency(): number {
    return this.frequency;
  }

  public setWpm(wpm: number) {
    this.wpm = Math.max(5, Math.min(45, wpm));
  }

  public getWpm(): number {
    return this.wpm;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Dot duration in milliseconds based on PARIS standard:
   * PARIS standard word has 50 dot lengths.
   * At WPM words per minute: dot duration = 60 / (50 * WPM) seconds = 1200 / WPM ms.
   */
  public getDotDurationMs(): number {
    return 1200 / this.wpm;
  }

  /**
   * Play an immediate single tone for a specified duration in milliseconds
   */
  public playTone(durationMs: number, customFreq?: number): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = customFreq || this.frequency;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const now = ctx.currentTime;
      const attackTime = 0.005; // 5ms soft attack to avoid clicking
      const releaseTime = 0.005;
      const durationSec = durationMs / 1000;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume, now + attackTime);
      gain.gain.setValueAtTime(this.volume, now + Math.max(attackTime, durationSec - releaseTime));
      gain.gain.linearRampToValueAtTime(0, now + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec + 0.01);

      setTimeout(() => {
        resolve();
      }, durationMs);
    });
  }

  /**
   * Start continuous tone for manual telegraph key
   */
  public startContinuousTone(customFreq?: number) {
    if (this.continuousOsc) return;
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(customFreq || this.frequency, ctx.currentTime);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.005);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);

    this.continuousOsc = osc;
    this.continuousGain = gain;
  }

  /**
   * Stop continuous tone for manual telegraph key
   */
  public stopContinuousTone() {
    if (!this.continuousOsc || !this.continuousGain) return;
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const gain = this.continuousGain;
    const osc = this.continuousOsc;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.008);

    setTimeout(() => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore if already stopped
      }
    }, 15);

    this.continuousOsc = null;
    this.continuousGain = null;
  }

  /**
   * Play single character morse code (e.g. '.-')
   */
  public async playMorseString(morse: string): Promise<void> {
    const dotMs = this.getDotDurationMs();
    for (let i = 0; i < morse.length; i++) {
      const sym = morse[i];
      if (sym === '.') {
        await this.playTone(dotMs);
        await new Promise((r) => setTimeout(r, dotMs)); // intra-char gap: 1 dot
      } else if (sym === '-') {
        await this.playTone(dotMs * 3);
        await new Promise((r) => setTimeout(r, dotMs)); // intra-char gap: 1 dot
      }
    }
  }

  /**
   * Play full sequence with synchronized progress callback for visual rendering
   */
  public async playSequence(
    breakdown: Array<{ index: number; char: string; morse: string; isSpace: boolean }>,
    onProgress: (p: PlaybackProgress) => void
  ): Promise<void> {
    this.stopSequence();
    this.isPlayingSequence = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const dotMs = this.getDotDurationMs();
    const dashMs = dotMs * 3;
    const intraCharGap = dotMs;
    const interCharGap = dotMs * 3;
    const wordGap = dotMs * 7;

    const sleep = (ms: number) => {
      return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    };

    try {
      for (let cIdx = 0; cIdx < breakdown.length; cIdx++) {
        if (signal.aborted) break;
        const item = breakdown[cIdx];

        if (item.isSpace || item.morse === '/') {
          onProgress({
            charIndex: cIdx,
            symbolIndex: 0,
            activeSymbol: '/',
            isSounding: false,
            isComplete: false,
          });
          await sleep(wordGap);
          continue;
        }

        const morseChars = item.morse.split('');
        for (let sIdx = 0; sIdx < morseChars.length; sIdx++) {
          if (signal.aborted) break;
          const symbol = morseChars[sIdx];

          if (symbol === '.' || symbol === '-') {
            const toneDuration = symbol === '.' ? dotMs : dashMs;

            // Signal start of sound
            onProgress({
              charIndex: cIdx,
              symbolIndex: sIdx,
              activeSymbol: symbol,
              isSounding: true,
              isComplete: false,
            });

            await this.playTone(toneDuration);

            // Turn off sound for the gap
            onProgress({
              charIndex: cIdx,
              symbolIndex: sIdx,
              activeSymbol: symbol,
              isSounding: false,
              isComplete: false,
            });

            // Intra-char gap unless it's the last symbol in character
            if (sIdx < morseChars.length - 1) {
              await sleep(intraCharGap);
            }
          }
        }

        // Inter-character gap before next character (if next is not a space)
        if (cIdx < breakdown.length - 1 && !breakdown[cIdx + 1].isSpace) {
          await sleep(interCharGap);
        }
      }

      onProgress({
        charIndex: -1,
        symbolIndex: -1,
        activeSymbol: ' ',
        isSounding: false,
        isComplete: true,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Safely aborted
      } else {
        console.error('Audio playback error', err);
      }
    } finally {
      this.isPlayingSequence = false;
      this.abortController = null;
    }
  }

  public stopSequence() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isPlayingSequence = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlayingSequence;
  }

  /**
   * Generates a downloadable WAV file blob of the Morse code sequence
   */
  public generateWavBlob(breakdown: Array<{ char: string; morse: string; isSpace: boolean }>): Blob {
    const sampleRate = 44100;
    const dotSec = this.getDotDurationMs() / 1000;
    const dashSec = dotSec * 3;
    const intraGapSec = dotSec;
    const interGapSec = dotSec * 3;
    const wordGapSec = dotSec * 7;

    // Calculate total duration in seconds
    let totalSec = 0.2; // 200ms padding
    for (let cIdx = 0; cIdx < breakdown.length; cIdx++) {
      const item = breakdown[cIdx];
      if (item.isSpace || item.morse === '/') {
        totalSec += wordGapSec;
      } else {
        const syms = item.morse.split('');
        for (let s = 0; s < syms.length; s++) {
          if (syms[s] === '.') totalSec += dotSec;
          else if (syms[s] === '-') totalSec += dashSec;
          if (s < syms.length - 1) totalSec += intraGapSec;
        }
        if (cIdx < breakdown.length - 1 && !breakdown[cIdx + 1].isSpace) {
          totalSec += interGapSec;
        }
      }
    }
    totalSec += 0.2; // trailing padding

    const totalSamples = Math.ceil(totalSec * sampleRate);
    const audioData = new Float32Array(totalSamples);

    let currentSample = Math.floor(0.1 * sampleRate);

    const renderTone = (durationSec: number) => {
      const samples = Math.floor(durationSec * sampleRate);
      const attackSamples = Math.floor(0.005 * sampleRate);
      const releaseSamples = Math.floor(0.005 * sampleRate);

      for (let i = 0; i < samples; i++) {
        if (currentSample + i >= totalSamples) break;
        const t = i / sampleRate;
        const wave = Math.sin(2 * Math.PI * this.frequency * t);

        // Linear envelope
        let env = 1.0;
        if (i < attackSamples) {
          env = i / attackSamples;
        } else if (i > samples - releaseSamples) {
          env = (samples - i) / releaseSamples;
        }
        audioData[currentSample + i] = wave * env * this.volume;
      }
      currentSample += samples;
    };

    const renderGap = (durationSec: number) => {
      currentSample += Math.floor(durationSec * sampleRate);
    };

    // Render sequence
    for (let cIdx = 0; cIdx < breakdown.length; cIdx++) {
      const item = breakdown[cIdx];
      if (item.isSpace || item.morse === '/') {
        renderGap(wordGapSec);
      } else {
        const syms = item.morse.split('');
        for (let s = 0; s < syms.length; s++) {
          const sym = syms[s];
          if (sym === '.') renderTone(dotSec);
          else if (sym === '-') renderTone(dashSec);
          if (s < syms.length - 1) renderGap(intraGapSec);
        }
        if (cIdx < breakdown.length - 1 && !breakdown[cIdx + 1].isSpace) {
          renderGap(interGapSec);
        }
      }
    }

    // Convert Float32Array to 16-bit PCM WAV Blob
    return encodeWav(audioData, sampleRate);
  }
}

/**
 * Encodes Float32 mono PCM samples to standard 16-bit PCM WAV Blob
 */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF identifier & file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = Mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write samples (clamped to 16-bit)
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const morseAudio = new MorseAudioEngine();
