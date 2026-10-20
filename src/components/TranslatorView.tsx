import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowRightLeft,
  Volume2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  textToMorseWithMeta,
  morseToText,
  PRESET_PHRASES,
  CharBreakdown,
} from '../data/morseData';
import { morseAudio, PlaybackProgress } from '../utils/morseAudio';
import { SignalBeacon } from './SignalBeacon';

interface TranslatorViewProps {
  onSelectCharForDictionary?: (char: string) => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = () => {
  const [mode, setMode] = useState<'text-to-morse' | 'morse-to-text'>('text-to-morse');
  const [inputText, setInputText] = useState('สวัสดี THAILAND SOS');
  const [inputMorse, setInputMorse] = useState('... --- ...');
  const [preferLang, setPreferLang] = useState<'auto' | 'thai' | 'english'>('auto');

  // Audio parameters
  const [wpm, setWpm] = useState(16);
  const [frequency, setFrequency] = useState(700);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enableOpticalFlash, setEnableOpticalFlash] = useState(false);

  // Synchronized playback state
  const [playbackState, setPlaybackState] = useState<PlaybackProgress>({
    charIndex: -1,
    symbolIndex: -1,
    activeSymbol: ' ',
    isSounding: false,
    isComplete: true,
  });

  const [copiedType, setCopiedType] = useState<'morse' | 'text' | null>(null);

  // Sync params to audio engine
  useEffect(() => {
    morseAudio.setWpm(wpm);
  }, [wpm]);

  useEffect(() => {
    morseAudio.setFrequency(frequency);
  }, [frequency]);

  // Clean up audio playback on unmount
  useEffect(() => {
    return () => {
      morseAudio.stopSequence();
    };
  }, []);

  // Compute conversion
  const { morse: computedMorse, breakdown } = React.useMemo(() => {
    if (mode === 'text-to-morse') {
      return textToMorseWithMeta(inputText);
    }
    return { morse: inputMorse, breakdown: [] };
  }, [inputText, inputMorse, mode]);

  const computedText = React.useMemo(() => {
    if (mode === 'morse-to-text') {
      return morseToText(inputMorse, preferLang);
    }
    return inputText;
  }, [inputMorse, preferLang, mode, inputText]);

  // Handle Play
  const handlePlayAudio = async () => {
    if (isPlaying) {
      morseAudio.stopSequence();
      setIsPlaying(false);
      setPlaybackState((prev) => ({ ...prev, isSounding: false, charIndex: -1 }));
      return;
    }

    if (mode === 'text-to-morse') {
      if (!breakdown.length) return;
      setIsPlaying(true);
      await morseAudio.playSequence(breakdown, (progress) => {
        setPlaybackState(progress);
        if (progress.isComplete) {
          setIsPlaying(false);
        }
      });
    } else {
      // Morse to text playback
      const tokens = inputMorse.trim().split(/\s+/);
      const tempBreakdown = tokens.map((token, idx) => ({
        index: idx,
        char: morseToText(token, preferLang) || '?',
        morse: token,
        isSpace: token === '/',
        isKnown: true,
        isThai: false,
      }));
      setIsPlaying(true);
      await morseAudio.playSequence(tempBreakdown, (progress) => {
        setPlaybackState(progress);
        if (progress.isComplete) {
          setIsPlaying(false);
        }
      });
    }
  };

  // Handle Copy
  const handleCopy = (text: string, type: 'morse' | 'text') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Handle Download WAV
  const handleDownloadWav = () => {
    let itemsToPlay: Array<{ char: string; morse: string; isSpace: boolean }> = [];
    if (mode === 'text-to-morse') {
      itemsToPlay = breakdown;
    } else {
      const tokens = inputMorse.trim().split(/\s+/);
      itemsToPlay = tokens.map((t) => ({
        char: morseToText(t, preferLang),
        morse: t,
        isSpace: t === '/',
      }));
    }
    if (!itemsToPlay.length) return;

    const wavBlob = morseAudio.generateWavBlob(itemsToPlay);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morse_cw_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle playing individual card
  const handlePlaySingleChar = (charItem: CharBreakdown) => {
    if (charItem.morse && charItem.morse !== '/' && charItem.morse !== '?') {
      morseAudio.playMorseString(charItem.morse);
    }
  };

  // Switch conversion modes
  const handleSwapMode = () => {
    if (mode === 'text-to-morse') {
      setInputMorse(computedMorse);
      setMode('morse-to-text');
    } else {
      setInputText(computedText);
      setMode('text-to-morse');
    }
    morseAudio.stopSequence();
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Visual Signal Beacon */}
      <SignalBeacon
        isSounding={playbackState.isSounding}
        activeSymbol={playbackState.activeSymbol}
        enableOpticalFlash={enableOpticalFlash}
        onToggleOpticalFlash={() => setEnableOpticalFlash(!enableOpticalFlash)}
        frequency={frequency}
        wpm={wpm}
      />

      {/* Main Workspace Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
        {/* Top Control Bar: Mode Toggle & Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => {
                  setMode('text-to-morse');
                  morseAudio.stopSequence();
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  mode === 'text-to-morse'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ข้อความ → รหัสมอส
              </button>
              <button
                onClick={() => {
                  setMode('morse-to-text');
                  morseAudio.stopSequence();
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  mode === 'morse-to-text'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                รหัสมอส → ข้อความ
              </button>
            </div>

            <button
              onClick={handleSwapMode}
              title="สลับโหมดการแปลง"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ตัวอย่าง:
            </span>
            {PRESET_PHRASES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  morseAudio.stopSequence();
                  setIsPlaying(false);
                  if (mode === 'text-to-morse') {
                    setInputText(preset.text);
                  } else {
                    const encoded = textToMorseWithMeta(preset.text).morse;
                    setInputMorse(encoded);
                  }
                }}
                title={preset.thaiLabel}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors whitespace-nowrap shrink-0 hover:border-amber-500/40"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: Input */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                {mode === 'text-to-morse' ? 'ข้อความต้นทาง (ภาษาไทย / อังกฤษ / ตัวเลข)' : 'รหัสมอสตันทาง (. - /)'}
              </span>
              <div className="flex items-center gap-2">
                <span>
                  {mode === 'text-to-morse' ? `${inputText.length} อักขระ` : `${inputMorse.split(/\s+/).filter(Boolean).length} รหัส`}
                </span>
                {(mode === 'text-to-morse' ? inputText : inputMorse) && (
                  <button
                    onClick={() => {
                      if (mode === 'text-to-morse') setInputText('');
                      else setInputMorse('');
                      morseAudio.stopSequence();
                      setIsPlaying(false);
                    }}
                    className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
                    title="ล้างข้อความ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {mode === 'text-to-morse' ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="พิมพ์ข้อความภาษาไทย หรือ ภาษาอังกฤษ เช่น 'สวัสดีครับ' หรือ 'HELLO WORLD'..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-y text-base font-normal leading-relaxed"
              />
            ) : (
              <div className="space-y-2">
                <textarea
                  value={inputMorse}
                  onChange={(e) => setInputMorse(e.target.value)}
                  placeholder="ป้อนรหัสมอส คั่นตัวอักษรด้วยเคาะวรรค และคั่นคำด้วย / เช่น: ... --- ... / -... .- --."
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-amber-300 font-morse placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-y text-base tracking-widest"
                />

                {/* Quick Morse Keypad for mobile/convenience */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMorse((prev) => prev + '.')}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-morse font-bold rounded text-sm transition-colors"
                  >
                    · Dit
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMorse((prev) => prev + '-')}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-morse font-bold rounded text-sm transition-colors"
                  >
                    — Dah
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMorse((prev) => prev + ' ')}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                  >
                    เว้นวรรค
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMorse((prev) => prev + ' / ')}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                  >
                    / เว้นคำ
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMorse((prev) => prev.slice(0, -1))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-400 rounded transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Panel 2: Result */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                {mode === 'text-to-morse' ? 'รหัสมอสผลลัพธ์ (Morse Code)' : 'ข้อความผลลัพธ์ (Decoded Text)'}
              </span>
              <div className="flex items-center gap-2">
                {mode === 'morse-to-text' && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-500">แปลเป็น:</span>
                    <select
                      value={preferLang}
                      onChange={(e) => setPreferLang(e.target.value as 'auto' | 'thai' | 'english')}
                      className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="auto">อัตโนมัติ (Auto)</option>
                      <option value="thai">ภาษาไทย (Thai)</option>
                      <option value="english">English</option>
                    </select>
                  </div>
                )}
                <button
                  onClick={() =>
                    handleCopy(
                      mode === 'text-to-morse' ? computedMorse : computedText,
                      mode === 'text-to-morse' ? 'morse' : 'text'
                    )
                  }
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 transition-colors"
                >
                  {copiedType ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-xs">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Display Box */}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 min-h-[140px] flex flex-col justify-between">
              {mode === 'text-to-morse' ? (
                <div className="text-amber-300 font-morse text-lg sm:text-xl font-medium tracking-widest break-all select-all leading-relaxed">
                  {computedMorse || <span className="text-slate-700 font-sans text-sm font-normal">รอการป้อนข้อความ...</span>}
                </div>
              ) : (
                <div className="text-slate-100 text-lg sm:text-xl font-medium select-all leading-relaxed whitespace-pre-wrap">
                  {computedText || <span className="text-slate-700 font-sans text-sm font-normal">รอการป้อนรหัสมอส...</span>}
                </div>
              )}

              <div className="pt-3 mt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {mode === 'text-to-morse' ? 'ระบบรหัสมอสไทย-สากล (มาตรฐาน CW)' : 'ถอดรหัสตามตารางคู่เทียบ'}
                </span>
                <span className="font-mono-nums">
                  {mode === 'text-to-morse' ? `${computedMorse.replace(/\s+/g, '').length} สัญญาณ` : `${computedText.length} อักขระ`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transmission & Audio Action Deck */}
        <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Transmission Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handlePlayAudio}
              disabled={!(mode === 'text-to-morse' ? computedMorse : inputMorse)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/20'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>หยุดส่งสัญญาณ (Stop)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>ส่งสัญญาณเสียง (Play CW Audio)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadWav}
              disabled={!(mode === 'text-to-morse' ? computedMorse : inputMorse)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 transition-colors text-xs font-medium disabled:opacity-40"
              title="ดาวน์โหลดไฟล์เสียง WAV ของรหัสนี้"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>โหลดไฟล์ .WAV</span>
            </button>
          </div>

          {/* Quick Audio Controls (WPM & Hz) */}
          <div className="flex flex-wrap items-center gap-5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">ความเร็ว:</span>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono-nums text-amber-300 w-12 text-right">
                {wpm} WPM
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">ความถี่โทน:</span>
              <input
                type="range"
                min="400"
                max="900"
                step="25"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono-nums text-amber-300 w-14 text-right">
                {frequency} Hz
              </span>
            </div>
          </div>
        </div>

        {/* Character-by-Character Visual Breakdown (Text to Morse) */}
        {mode === 'text-to-morse' && breakdown.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                แผนผังอักขระและรหัสมอส (คลิกเพื่อฟังเสียงแต่ละตัว):
              </span>
              <span className="text-[11px] text-slate-500">
                ไฟเรืองแสดงตำแหน่งที่กำลังเคาะเสียง
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {breakdown.map((item, idx) => {
                const isActiveChar = playbackState.charIndex === idx;

                if (item.isSpace) {
                  return (
                    <div
                      key={`space-${idx}`}
                      className={`px-3 py-2 rounded-lg border text-xs flex flex-col items-center justify-center transition-colors ${
                        isActiveChar
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 uppercase">Space</span>
                      <span className="font-morse font-bold text-slate-400">/</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={`${item.char}-${idx}`}
                    onClick={() => handlePlaySingleChar(item)}
                    title={`คลิกฟังรหัสของ '${item.char}': ${item.morse}`}
                    className={`group px-3 py-2 rounded-lg border text-left transition-all ${
                      isActiveChar
                        ? 'bg-amber-500/25 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.char}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.isThai ? 'ไทย' : 'EN'}
                      </span>
                    </div>
                    <div
                      className={`font-morse text-xs tracking-wider mt-0.5 ${
                        isActiveChar ? 'text-amber-300 font-bold' : 'text-amber-400/90'
                      }`}
                    >
                      {item.morse}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Informative Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
          <Info className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            ระบบเทียบเสียงภาษาไทยอิงตามหลักการสื่อสารโทรเลขสากล โดยพยัญชนะไทยจะถูกแปลงเทียบเป็นรหัสมอสสากล
            และการเว้นวรรคระหว่างคำจะถูกคั่นด้วยเครื่องหมายสแลช (<span className="text-amber-300 font-mono font-bold">/</span>)
            ตามระเบียบโทรเลขสากล
          </p>
        </div>
      </div>
    </div>
  );
};
