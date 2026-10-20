import React from 'react';
import { Eye, EyeOff, Radio } from 'lucide-react';

interface SignalBeaconProps {
  isSounding: boolean;
  activeSymbol: string;
  enableOpticalFlash: boolean;
  onToggleOpticalFlash: () => void;
  frequency: number;
  wpm: number;
}

export const SignalBeacon: React.FC<SignalBeaconProps> = ({
  isSounding,
  activeSymbol,
  enableOpticalFlash,
  onToggleOpticalFlash,
  frequency,
  wpm,
}) => {
  return (
    <>
      {/* Fullscreen subtle ambient strobe if enabled */}
      {enableOpticalFlash && isSounding && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-50 bg-amber-400/15 backdrop-brightness-110 transition-opacity duration-75"
        />
      )}

      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Beacon Optical Lamp */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex items-center justify-center">
            {/* Outer reflector glow */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-75 border-2 ${
                isSounding
                  ? 'bg-amber-400 border-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.85)] scale-105'
                  : 'bg-slate-950 border-slate-700/80 shadow-inner'
              }`}
            >
              {/* Core filament bulb */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-75 ${
                  isSounding
                    ? 'bg-white shadow-[0_0_15px_#ffffff]'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            </div>

            {/* Ripple ring when active */}
            {isSounding && (
              <span className="absolute inset-0 rounded-full border border-amber-400/60 animate-ping pointer-events-none" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                สัญญาณไฟโทรเลข (Optical Signal)
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${
                  isSounding
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isSounding ? (activeSymbol === '.' ? 'DIT (จุด)' : activeSymbol === '-' ? 'DAH (ขีด)' : 'ON') : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              จำลองโคมไฟส่งสัญญาณรหัสกระพริบ (Aldis Lamp) ตามจังหวะ CW
            </p>
          </div>
        </div>

        {/* Status and toggles */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right text-xs text-slate-400 font-mono-nums hidden lg:block">
            <span className="text-slate-300 font-semibold">{frequency} Hz</span> ·{' '}
            <span className="text-slate-300 font-semibold">{wpm} WPM</span>
          </div>

          <button
            onClick={onToggleOpticalFlash}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              enableOpticalFlash
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
          >
            {enableOpticalFlash ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>ไฟกระพริบทั่วจอ: เปิด</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>ไฟกระพริบทั่วจอ: ปิด</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
