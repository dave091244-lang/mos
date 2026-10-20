import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Award,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  THAI_CONSONANTS,
  ENGLISH_LETTERS,
  NUMBERS,
  MORSE_CODE_DICT,
  THAI_MORSE_DICT,
} from '../data/morseData';
import { morseAudio } from '../utils/morseAudio';

type PracticeMode = 'audio-to-char' | 'morse-to-char' | 'char-to-morse';
type QuestionScope = 'thai' | 'english' | 'numbers' | 'mixed';

interface QuestionItem {
  char: string;
  morse: string;
  category: string;
}

export const PracticeView: React.FC = () => {
  const [mode, setMode] = useState<PracticeMode>('audio-to-char');
  const [scope, setScope] = useState<QuestionScope>('thai');

  // Stats
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Current Question
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem | null>(null);
  const [options, setOptions] = useState<QuestionItem[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<QuestionItem | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Pool of available items
  const pool = React.useMemo(() => {
    const items: QuestionItem[] = [];

    if (scope === 'thai' || scope === 'mixed') {
      THAI_CONSONANTS.forEach((c) => {
        items.push({
          char: c,
          morse: THAI_MORSE_DICT[c] || '',
          category: 'ไทย',
        });
      });
    }

    if (scope === 'english' || scope === 'mixed') {
      ENGLISH_LETTERS.forEach((c) => {
        items.push({
          char: c,
          morse: MORSE_CODE_DICT[c] || '',
          category: 'อังกฤษ',
        });
      });
    }

    if (scope === 'numbers' || scope === 'mixed') {
      NUMBERS.forEach((c) => {
        items.push({
          char: c,
          morse: MORSE_CODE_DICT[c] || '',
          category: 'ตัวเลข',
        });
      });
    }

    return items;
  }, [scope]);

  // Generate new question
  const nextQuestion = React.useCallback(() => {
    if (!pool.length) return;

    // Pick 1 correct target
    const target = pool[Math.floor(Math.random() * pool.length)];

    // Pick 3 unique distractors with different morse/char
    const distractors: QuestionItem[] = [];
    const usedChars = new Set([target.char]);

    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    for (const item of shuffledPool) {
      if (!usedChars.has(item.char) && item.morse !== target.morse) {
        distractors.push(item);
        usedChars.add(item.char);
        if (distractors.length >= 3) break;
      }
    }

    const allOpts = [target, ...distractors].sort(() => 0.5 - Math.random());

    setCurrentQuestion(target);
    setOptions(allOpts);
    setSelectedAnswer(null);
    setIsAnswered(false);

    // Auto-play sound if audio mode
    if (mode === 'audio-to-char') {
      setTimeout(() => {
        playTargetAudio(target.morse);
      }, 150);
    }
  }, [pool, mode]);

  // Reset or initialize when scope or mode changes
  useEffect(() => {
    nextQuestion();
  }, [scope, mode, nextQuestion]);

  const playTargetAudio = async (morseCode?: string) => {
    const code = morseCode || currentQuestion?.morse;
    if (!code || isPlayingAudio) return;
    setIsPlayingAudio(true);
    await morseAudio.playMorseString(code);
    setIsPlayingAudio(false);
  };

  const handleSelectOption = (option: QuestionItem) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(option);
    setIsAnswered(true);
    setTotalAnswered((prev) => prev + 1);

    const isCorrect =
      mode === 'char-to-morse'
        ? option.morse === currentQuestion.morse
        : option.char === currentQuestion.char;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setTotalCorrect((prev) => prev + 1);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);

      // Trigger celebratory confetti on notable streaks!
      if (nextStreak > 0 && nextStreak % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      setStreak(0);
    }
  };

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
        {/* Header and stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              ห้องฝึกฝนรหัสมอส (Morse Code Training Quiz)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ฝึกจำรหัสมอสทั้งภาษาไทยและสากลผ่านควิซทดสอบแบบโต้ตอบ
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 text-xs font-mono-nums">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-slate-400">Streak:</span>
              <span className="text-amber-300 font-bold">{streak}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">สถิติสูงสุด:</span>
              <span className="text-slate-200 font-bold">{bestStreak}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">ความแม่นยำ:</span>
              <span className="text-emerald-400 font-bold">{accuracy}%</span>
              <span className="text-slate-500 text-[11px]">({totalCorrect}/{totalAnswered})</span>
            </div>
          </div>
        </div>

        {/* Practice Mode & Scope Selectors */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          {/* Mode Switch */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1 hidden sm:inline">โหมดทดสอบ:</span>
            <button
              onClick={() => setMode('audio-to-char')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                mode === 'audio-to-char'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ฟังเสียง → ทายตัวอักษร
            </button>
            <button
              onClick={() => setMode('morse-to-char')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                mode === 'morse-to-char'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ดูรหัส → ทายตัวอักษร
            </button>
            <button
              onClick={() => setMode('char-to-morse')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                mode === 'char-to-morse'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ดูตัวอักษร → เลือกรหัส
            </button>
          </div>

          {/* Scope Switch */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-1">หมวดหมู่:</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as QuestionScope)}
              className="bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="thai">พยัญชนะไทย</option>
              <option value="english">ภาษาอังกฤษ (A-Z)</option>
              <option value="numbers">ตัวเลข (0-9)</option>
              <option value="mixed">สุ่มทั้งหมด</option>
            </select>
          </div>
        </div>

        {/* Active Question Stage */}
        {currentQuestion && (
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-6">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              {mode === 'audio-to-char' && 'ฟังเสียงรหัสต่อไปนี้แล้วเลือกว่าตรงกับตัวอักษรใด'}
              {mode === 'morse-to-char' && 'รหัสมอสนี้ตรงกับตัวอักษรใด'}
              {mode === 'char-to-morse' && 'ตัวอักษรนี้ตรงกับรหัสมอสใด'}
            </span>

            {/* Target Display Prompt */}
            {mode === 'audio-to-char' && (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => playTargetAudio()}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isPlayingAudio
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-105'
                      : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                  }`}
                  title="คลิกเพื่อฟังเสียงรหัสมอสซ้ำ"
                >
                  <Volume2 className={`w-8 h-8 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                </button>
                <span className="text-xs text-slate-400">คลิกเพื่อฟังเสียงซ้ำ</span>
              </div>
            )}

            {mode === 'morse-to-char' && (
              <div className="text-center space-y-2">
                <div className="font-morse text-4xl sm:text-5xl font-bold text-amber-300 tracking-widest py-2">
                  {currentQuestion.morse}
                </div>
                <button
                  onClick={() => playTargetAudio()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>ฟังเสียง CW</span>
                </button>
              </div>
            )}

            {mode === 'char-to-morse' && (
              <div className="text-center space-y-2">
                <div className="text-6xl font-bold text-white py-2">
                  {currentQuestion.char}
                </div>
                <span className="text-xs text-slate-400">หมวด: {currentQuestion.category}</span>
              </div>
            )}

            {/* 4 Answer Choice Options */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg pt-4">
              {options.map((opt, idx) => {
                const isSelected = selectedAnswer?.char === opt.char;
                const isCorrect =
                  mode === 'char-to-morse'
                    ? opt.morse === currentQuestion.morse
                    : opt.char === currentQuestion.char;

                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-850 hover:border-slate-700';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-850 text-slate-600 opacity-50';
                  }
                }

                return (
                  <button
                    key={`${opt.char}-${idx}`}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`py-4 px-4 rounded-xl border font-bold text-center transition-all flex flex-col items-center justify-center gap-1 select-none active:scale-98 ${btnStyle}`}
                  >
                    {mode === 'char-to-morse' ? (
                      <span className="font-morse text-xl tracking-widest text-amber-300">
                        {opt.morse}
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl text-white">{opt.char}</span>
                        {isAnswered && (
                          <span className="font-morse text-xs text-slate-400 tracking-wider">
                            {opt.morse}
                          </span>
                        )}
                      </>
                    )}

                    {isAnswered && isCorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> ถูกต้อง
                      </span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-sans mt-0.5">
                        <XCircle className="w-3 h-3" /> ผิด
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next question button */}
            {isAnswered && (
              <div className="pt-2 animate-fade-in">
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span>ข้อถัดไป (Next)</span>
                  <Sparkles className="w-4 h-4 fill-current" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
