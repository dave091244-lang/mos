/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TranslatorView } from './components/TranslatorView';
import { TelegraphKeyerView } from './components/TelegraphKeyerView';
import { DictionaryView } from './components/DictionaryView';
import { PracticeView } from './components/PracticeView';
import { SettingsModal } from './components/SettingsModal';
import { morseAudio } from './utils/morseAudio';
import { Radio, Sparkles, BookOpen, Volume2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('translator');
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio settings
  const [frequency, setFrequency] = useState(700);
  const [wpm, setWpm] = useState(16);
  const [volume, setVolume] = useState(0.6);

  useEffect(() => {
    morseAudio.setFrequency(frequency);
  }, [frequency]);

  useEffect(() => {
    morseAudio.setWpm(wpm);
  }, [wpm]);

  useEffect(() => {
    if (isMuted) {
      morseAudio.setVolume(0);
    } else {
      morseAudio.setVolume(volume);
    }
  }, [isMuted, volume]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Subtle Hero Kicker (No pills, no code prefixes) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
              <span>รหัสมอสมาตรฐานภาษาไทยและสากล</span>
              <span aria-hidden="true">·</span>
              <span>International Morse & Thai CW Sidetone</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'translator' && 'เครื่องมือแปลงและจำลองเสียงรหัสมอส'}
              {activeTab === 'keyer' && 'คีย์โทรเลขจำลองและการเคาะรหัสสด'}
              {activeTab === 'dictionary' && 'ตารางคู่เทียบรหัสมอส ไทย-สากล'}
              {activeTab === 'practice' && 'ห้องฝึกทักษะและควิซรหัสมอส'}
            </h1>
          </div>

          {/* Quick tab switcher pill-free bar */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-nums">
            <span>CW Sidetone: {frequency}Hz</span>
            <span aria-hidden="true">·</span>
            <span>Speed: {wpm} WPM</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'translator' && <TranslatorView />}
        {activeTab === 'keyer' && <TelegraphKeyerView />}
        {activeTab === 'dictionary' && <DictionaryView />}
        {activeTab === 'practice' && <PracticeView />}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">MorseStudio.th</span>
            <span aria-hidden="true">·</span>
            <span>รองรับพยัญชนะไทย สระ วรรณยุกต์ ภาษาอังกฤษ ตัวเลข และสัญลักษณ์สากล</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('translator')}
              className="hover:text-amber-400 transition-colors"
            >
              แปลงรหัส
            </button>
            <button
              onClick={() => setActiveTab('keyer')}
              className="hover:text-amber-400 transition-colors"
            >
              คีย์สด
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className="hover:text-amber-400 transition-colors"
            >
              ตารางเทียบ
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className="hover:text-amber-400 transition-colors"
            >
              แบบฝึกหัด
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        wpm={wpm}
        onWpmChange={setWpm}
        volume={volume}
        onVolumeChange={setVolume}
      />
    </div>
  );
}
