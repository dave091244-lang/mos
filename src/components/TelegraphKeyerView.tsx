import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Radio,
  Keyboard
} from 'lucide-react';
import { morseAudio } from '../utils/morseAudio';
import { morseToText, MORSE_TO_ENGLISH, MORSE_TO_THAI } from '../data/morseData';

export const TelegraphKeyerView: React.FC = () => {
  const [isKeyDown, setIsKeyDown] = useState(false);
  const [currentMorseBuffer, setCurrentMorseBuffer] = useState('');
  const [decodedHistory, setDecodedHistory] = useState<string>('');
  const [preferLang, setPreferLang] = useState<'auto' | 'thai' | 'english'>('auto');
  const [copied, setCopied] = useState(false);
  const [keyPressStats, setKeyPressStats] = useState({ dots: 0, dashes: 0 });

  // Timings and state refs
  const keyDownTimestampRef = useRef<number>(0);
  const letterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseDownRef = useRef(false);

  const dotDurationMs = morseAudio.getDotDurationMs();
  const dahThresholdMs = dotDurationMs * 2.2; // threshold between dit and dah
  const charGapMs = dotDurationMs * 3.5; // timeout to complete letter
  const wordGapMs = dotDurationMs * 7.5; // timeout to insert word space

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      morseAudio.stopContinuousTone();
      if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    };
  }, []);

  // Commit current morse letter to text
  const commitCurrentLetter = (morseCode: string) => {
    if (!morseCode) return;
    const decodedChar = morseToText(morseCode, preferLang);
    setDecodedHistory((prev) => prev + (decodedChar || '?'));
    setCurrentMorseBuffer('');
  };

  // Start Key Down
  const handleKeyDownAction = () => {
    if (isKeyDown) return;
    setIsKeyDown(true);
    keyDownTimestampRef.current = Date.now();

    // Cancel pending letter / word timers
    if (letterTimerRef.current) {
      clearTimeout(letterTimerRef.current);
      letterTimerRef.current = null;
    }
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }

    // Play tone immediately
    morseAudio.startContinuousTone();
  };

  // End Key Up
  const handleKeyUpAction = () => {
    if (!isKeyDown) return;
    setIsKeyDown(false);
    morseAudio.stopContinuousTone();

    const pressDuration = Date.now() - keyDownTimestampRef.current;
    const symbol = pressDuration >= dahThresholdMs ? '-' : '.';

    if (symbol === '.') {
      setKeyPressStats((prev) => ({ ...prev, dots: prev.dots + 1 }));
    } else {
      setKeyPressStats((prev) => ({ ...prev, dashes: prev.dashes + 1 }));
    }

    const nextMorse = currentMorseBuffer + symbol;
    setCurrentMorseBuffer(nextMorse);

    // Schedule letter commit timer
    letterTimerRef.current = setTimeout(() => {
      commitCurrentLetter(nextMorse);

      // Schedule word space timer
      wordTimerRef.current = setTimeout(() => {
        setDecodedHistory((prev) => (prev.endsWith(' ') ? prev : prev + ' '));
      }, wordGapMs - charGapMs);
    }, charGapMs);
  };

  // Keyboard Spacebar listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Prevent default page scroll on spacebar
        e.preventDefault();
        handleKeyDownAction();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleKeyUpAction();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isKeyDown, currentMorseBuffer, preferLang, dahThresholdMs, charGapMs, wordGapMs]);

  // Manual Dit/Dah buttons for exact tapping
  const addSymbolExplicitly = (symbol: '.' | '-') => {
    if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);

    morseAudio.playTone(symbol === '.' ? dotDurationMs : dotDurationMs * 3);
    if (symbol === '.') {
      setKeyPressStats((prev) => ({ ...prev, dots: prev.dots + 1 }));
    } else {
      setKeyPressStats((prev) => ({ ...prev, dashes: prev.dashes + 1 }));
    }

    const nextMorse = currentMorseBuffer + symbol;
    setCurrentMorseBuffer(nextMorse);

    letterTimerRef.current = setTimeout(() => {
      commitCurrentLetter(nextMorse);
      wordTimerRef.current = setTimeout(() => {
        setDecodedHistory((prev) => (prev.endsWith(' ') ? prev : prev + ' '));
      }, wordGapMs - charGapMs);
    }, charGapMs);
  };

  const handleCopyDecoded = () => {
    navigator.clipboard.writeText(decodedHistory);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCurrentMorseBuffer('');
    setDecodedHistory('');
  };

  const handleBackspace = () => {
    if (currentMorseBuffer) {
      setCurrentMorseBuffer('');
    } else {
      setDecodedHistory((prev) => prev.slice(0, -1));
    }
  };

  const currentPreviewChar = currentMorseBuffer
    ? morseToText(currentMorseBuffer, preferLang)
    : null;

  return (
    <div className="space-y-6">
      {/* Telegraph Keyer Header card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              เครื่องเคาะรหัสโทรเลขสด (Telegraph Straight Key)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              กดค้างที่คันเคาะ หรือกดปุ่ม <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">Spacebar</kbd> บนคีย์บอร์ดเพื่อเคาะรหัส
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>ภาษาถอดรหัส:</span>
              <select
                value={preferLang}
                onChange={(e) => setPreferLang(e.target.value as 'auto' | 'thai' | 'english')}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="auto">สากล / อังกฤษ</option>
                <option value="thai">ภาษาไทย</option>
              </select>
            </div>

            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="ล้างข้อมูลที่เคาะทั้งหมด"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Decoded Output Monitor */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">ข้อความที่ถอดรหัสได้สด (Live Decoded):</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackspace}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
              >
                ลบอักษรล่าสุด (Backspace)
              </button>
              <button
                onClick={handleCopyDecoded}
                disabled={!decodedHistory}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>

          {/* Decoded Stream Text */}
          <div className="min-h-[80px] bg-slate-900/60 rounded-lg p-3 text-xl sm:text-2xl font-medium text-slate-100 flex items-center flex-wrap gap-1 border border-slate-850">
            {decodedHistory ? (
              <span>{decodedHistory}</span>
            ) : (
              <span className="text-slate-600 text-sm font-normal">
                ยังไม่มีข้อมูลเคาะ... ลองกด Spacebar หรือกดคันเคาะด้านล่าง
              </span>
            )}

            {/* Currently Active Buffer Letter */}
            {currentMorseBuffer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-morse text-lg animate-pulse ml-1">
                <span>{currentMorseBuffer}</span>
                {currentPreviewChar && (
                  <span className="text-xs text-white bg-amber-600 px-1 rounded ml-1 font-sans">
                    ({currentPreviewChar})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Live Telegraph Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono-nums">
            <div className="flex items-center gap-3">
              <span>สถิติการเคาะ:</span>
              <span className="text-amber-400 font-bold">{keyPressStats.dots} Dit (จุด)</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">{keyPressStats.dashes} Dah (ขีด)</span>
            </div>
            <div>
              เกณฑ์แยก Dah: <span className="text-slate-400 font-bold">{Math.round(dahThresholdMs)} ms</span>
            </div>
          </div>
        </div>

        {/* Tactile Straight Key Visual Simulator */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-6 select-none">
          {/* Key Arm Mechanism */}
          <div className="relative w-full max-w-md h-36 flex items-center justify-center">
            {/* Wooden Base Board */}
            <div className="absolute inset-x-4 bottom-2 h-6 bg-amber-950/60 rounded-lg border border-amber-800/40 shadow-inner" />

            {/* Brass Pivot & Key Arm */}
            <div
              className={`relative z-10 w-72 h-10 transition-transform duration-75 origin-left ${
                isKeyDown ? 'rotate-2 translate-y-1.5' : '-rotate-1'
              }`}
            >
              {/* Pivot Pillar (Left) */}
              <div className="absolute left-0 top-0 w-8 h-12 bg-gradient-to-b from-amber-600 to-amber-800 rounded-sm shadow-md border-t border-amber-400" />

              {/* Brass Lever Rod */}
              <div className="absolute left-6 top-3 w-56 h-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full shadow-md border-t border-amber-200" />

              {/* Contact Gap Spark Indicator */}
              <div
                className={`absolute right-12 top-6 w-3 h-3 rounded-full transition-all duration-75 ${
                  isKeyDown
                    ? 'bg-cyan-350 shadow-[0_0_12px_#38bdf8] scale-125'
                    : 'bg-slate-700'
                }`}
              />

              {/* Black Bakelite Knob (Handle) */}
              <div
                className={`absolute right-2 -top-4 w-14 h-14 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black border-2 border-slate-700 shadow-xl cursor-pointer flex items-center justify-center transition-all ${
                  isKeyDown
                    ? 'scale-95 shadow-amber-500/20'
                    : 'hover:border-amber-500 hover:scale-102'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 shadow-inner flex items-center justify-center">
                  <div
                    className={`w-3 h-3 rounded-full transition-colors ${
                      isKeyDown ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Key Down Tap Button (Large target for touch & mouse) */}
          <div className="w-full max-w-md space-y-3">
            <button
              onMouseDown={handleKeyDownAction}
              onMouseUp={handleKeyUpAction}
              onMouseLeave={handleKeyUpAction}
              onTouchStart={(e) => {
                e.preventDefault();
                handleKeyDownAction();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleKeyUpAction();
              }}
              className={`w-full py-5 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all select-none shadow-xl border flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 ${
                isKeyDown
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.5)] translate-y-1'
                  : 'bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-amber-500/60 shadow-amber-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 fill-current" />
                <span>{isKeyDown ? 'กำลังส่งสัญญาณเสียง...' : 'กดค้างที่นี่ เพื่อเคาะรหัส (STRAIGHT KEY)'}</span>
              </div>
              <span className="text-xs font-normal opacity-85">
                (แตะสั้น = จุด Dit · / แตะค้าง = ขีด Dah —)
              </span>
            </button>

            {/* Quick Dit / Dah Tap Buttons for alternative input */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => addSymbolExplicitly('.')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>เคาะ จุด (Dit ·)</span>
              </button>
              <button
                type="button"
                onClick={() => addSymbolExplicitly('-')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <span className="w-6 h-1.5 rounded bg-amber-400" />
                <span>เคาะ ขีด (Dah —)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Helpful instructions */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
          <Keyboard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">วิธีใช้งานแป้นพิมพ์:</strong> กดปุ่ม Spacebar บนคีย์บอร์ดค้างไว้
            ระบบจะคำนวณระยะเวลากดอัตโนมัติ หากกดสั้นกว่า {Math.round(dahThresholdMs)}ms จะได้รหัส Dit (·)
            หากกดค้างยาวกว่านั้นจะได้ Dah (—) และเมื่อหยุดเคาะครู่หนึ่ง ระบบจะนำรหัสไปเทียบตัวอักษรและเว้นวรรคให้โดยอัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
};
