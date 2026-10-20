import React from 'react';
import { X, Sliders, Volume2, Gauge, Music, Info } from 'lucide-react';
import { morseAudio } from '../utils/morseAudio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  frequency: number;
  onFrequencyChange: (freq: number) => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  frequency,
  onFrequencyChange,
  wpm,
  onWpmChange,
  volume,
  onVolumeChange,
}) => {
  if (!isOpen) return null;

  const dotDurationMs = Math.round(1200 / wpm);

  const testTone = () => {
    morseAudio.playMorseString('.-');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">ตั้งค่าเสียงและความเร็วโทรเลข (CW)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-5 text-xs text-slate-300">
          {/* WPM Speed */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                ความเร็วการส่ง (Transmission Speed)
              </span>
              <span className="font-mono-nums text-amber-300 font-bold">{wpm} WPM</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={wpm}
              onChange={(e) => onWpmChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono-nums">
              <span>5 WPM (ช้า - ฝึกหัด)</span>
              <span>จุด (Dot) = {dotDurationMs} ms</span>
              <span>40 WPM (เร็วมาก)</span>
            </div>
          </div>

          {/* Tone Frequency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                ความถี่เสียงเคาะ (Sidetone Frequency)
              </span>
              <span className="font-mono-nums text-amber-300 font-bold">{frequency} Hz</span>
            </div>
            <input
              type="range"
              min="400"
              max="1000"
              step="25"
              value={frequency}
              onChange={(e) => onFrequencyChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono-nums">
              <span>400 Hz (ทุ้ม)</span>
              <span>700 Hz (มาตรฐานวิทยุสากล)</span>
              <span>1000 Hz (แหลม)</span>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                ระดับความดัง (Master Volume)
              </span>
              <span className="font-mono-nums text-amber-300 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Timing Specification explanation */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>มาตรฐานเวลาโทรเลข PARIS:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
              <li>1 จุด (Dit) = 1 หน่วยเวลา (t)</li>
              <li>1 ขีด (Dah) = 3 หน่วยเวลา (3t)</li>
              <li>ช่องว่างระหว่างสัญลักษณ์ = 1t</li>
              <li>ช่องว่างระหว่างตัวอักษร = 3t</li>
              <li>ช่องว่างระหว่างคำ (สแลช /) = 7t</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={testTone}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>ทดสอบเสียง (A: .-)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
