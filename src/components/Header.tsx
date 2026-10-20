import React from 'react';
import { Volume2, VolumeX, Sliders } from 'lucide-react';

export type ActiveTab = 'translator' | 'keyer' | 'dictionary' | 'practice';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  onOpenSettings,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('translator')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-morse font-bold text-lg group-hover:border-amber-400 transition-colors">
              .-
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
                MorseStudio.th
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap">
                ระบบรหัสมอสไทย-สากล & CW Telegraph
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onTabChange('translator')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-sm ${
              activeTab === 'translator'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            เครื่องมือแปลงรหัส
          </button>
          <button
            onClick={() => onTabChange('keyer')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-sm ${
              activeTab === 'keyer'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            เคาะรหัสสด (Keyer)
          </button>
          <button
            onClick={() => onTabChange('dictionary')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-sm ${
              activeTab === 'dictionary'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            ตารางเทียบรหัส
          </button>
          <button
            onClick={() => onTabChange('practice')}
            className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-sm ${
              activeTab === 'practice'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            ฝึกฝน & ควิซ
          </button>
        </nav>

        {/* Zone 3: Quick Action & Settings */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'เปิดเสียงโทรเลข' : 'ปิดเสียงโทรเลข'}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ตั้งค่าความถี่/ความเร็ว</span>
            <span className="sm:hidden">ตั้งค่า</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-850 px-2 py-1.5 gap-1 overflow-x-auto bg-slate-950/95 scrollbar-none">
        <button
          onClick={() => onTabChange('translator')}
          className={`flex-1 min-w-[76px] py-1.5 px-2 text-xs rounded-md text-center transition-colors whitespace-nowrap ${
            activeTab === 'translator'
              ? 'bg-amber-500/20 text-amber-300 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          แปลงรหัส
        </button>
        <button
          onClick={() => onTabChange('keyer')}
          className={`flex-1 min-w-[76px] py-1.5 px-2 text-xs rounded-md text-center transition-colors whitespace-nowrap ${
            activeTab === 'keyer'
              ? 'bg-amber-500/20 text-amber-300 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          เคาะรหัสสด
        </button>
        <button
          onClick={() => onTabChange('dictionary')}
          className={`flex-1 min-w-[76px] py-1.5 px-2 text-xs rounded-md text-center transition-colors whitespace-nowrap ${
            activeTab === 'dictionary'
              ? 'bg-amber-500/20 text-amber-300 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ตารางเทียบ
        </button>
        <button
          onClick={() => onTabChange('practice')}
          className={`flex-1 min-w-[76px] py-1.5 px-2 text-xs rounded-md text-center transition-colors whitespace-nowrap ${
            activeTab === 'practice'
              ? 'bg-amber-500/20 text-amber-300 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ฝึกฝน
        </button>
      </div>
    </header>
  );
};
