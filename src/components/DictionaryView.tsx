import React, { useState } from 'react';
import {
  Search,
  Volume2,
  Copy,
  Check,
  BookOpen,
  Filter
} from 'lucide-react';
import {
  THAI_CONSONANTS,
  THAI_VOWELS_TONES,
  ENGLISH_LETTERS,
  NUMBERS,
  SYMBOLS,
  MORSE_CODE_DICT,
  THAI_MORSE_DICT
} from '../data/morseData';
import { morseAudio } from '../utils/morseAudio';

type CategoryTab = 'all' | 'thai-consonants' | 'thai-vowels' | 'english' | 'numbers' | 'symbols';

interface ItemEntry {
  char: string;
  morse: string;
  category: 'thai-consonants' | 'thai-vowels' | 'english' | 'numbers' | 'symbols';
  categoryLabel: string;
  soundLabel: string;
}

export const DictionaryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingChar, setPlayingChar] = useState<string | null>(null);
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  // Compile unified list
  const allEntries: ItemEntry[] = React.useMemo(() => {
    const list: ItemEntry[] = [];

    // Thai consonants
    THAI_CONSONANTS.forEach((c) => {
      list.push({
        char: c,
        morse: THAI_MORSE_DICT[c] || '',
        category: 'thai-consonants',
        categoryLabel: 'พยัญชนะไทย',
        soundLabel: `${c} (เสียงเทียบ: ${THAI_MORSE_DICT[c]})`,
      });
    });

    // Thai vowels & tones
    THAI_VOWELS_TONES.forEach((c) => {
      list.push({
        char: c,
        morse: THAI_MORSE_DICT[c] || '',
        category: 'thai-vowels',
        categoryLabel: 'สระ/วรรณยุกต์ไทย',
        soundLabel: `สระ/เครื่องหมาย ${c}`,
      });
    });

    // English letters
    ENGLISH_LETTERS.forEach((c) => {
      list.push({
        char: c,
        morse: MORSE_CODE_DICT[c] || '',
        category: 'english',
        categoryLabel: 'ภาษาอังกฤษ (A-Z)',
        soundLabel: `Letter ${c}`,
      });
    });

    // Numbers
    NUMBERS.forEach((c) => {
      list.push({
        char: c,
        morse: MORSE_CODE_DICT[c] || '',
        category: 'numbers',
        categoryLabel: 'ตัวเลข (0-9)',
        soundLabel: `Number ${c}`,
      });
    });

    // Symbols
    SYMBOLS.forEach((c) => {
      list.push({
        char: c,
        morse: MORSE_CODE_DICT[c] || '',
        category: 'symbols',
        categoryLabel: 'สัญลักษณ์สากล',
        soundLabel: `Symbol ${c}`,
      });
    });

    return list;
  }, []);

  // Filter entries
  const filteredEntries = React.useMemo(() => {
    return allEntries.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesChar = item.char.toLowerCase().includes(q);
        const matchesMorse = item.morse.includes(q);
        const matchesCategory = item.categoryLabel.toLowerCase().includes(q);
        return matchesChar || matchesMorse || matchesCategory;
      }
      return true;
    });
  }, [allEntries, selectedCategory, searchQuery]);

  const handlePlayChar = async (entry: ItemEntry) => {
    if (!entry.morse) return;
    setPlayingChar(entry.char);
    await morseAudio.playMorseString(entry.morse);
    setPlayingChar(null);
  };

  const handleCopyMorse = (entry: ItemEntry) => {
    navigator.clipboard.writeText(entry.morse);
    setCopiedChar(entry.char);
    setTimeout(() => setCopiedChar(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
        {/* Title and search bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              พจนานุกรมและตารางเทียบรหัสมอส (Morse Code Directory)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              รวมตารางเทียบภาษาไทย พยัญชนะ สระ ตัวเลข และอักขระสากล คลิกที่การ์ดเพื่อฟังเสียงเคาะ CW ทันที
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตัวอักษร หรือรหัส เช่น 'ก', 'A', '.-'..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ทั้งหมด ({allEntries.length})
          </button>
          <button
            onClick={() => setSelectedCategory('thai-consonants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'thai-consonants'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            พยัญชนะไทย ({THAI_CONSONANTS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('thai-vowels')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'thai-vowels'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            สระ/วรรณยุกต์ไทย ({THAI_VOWELS_TONES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('english')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'english'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ภาษาอังกฤษ ({ENGLISH_LETTERS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('numbers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'numbers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ตัวเลข ({NUMBERS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('symbols')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'symbols'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            สัญลักษณ์ ({SYMBOLS.length})
          </button>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredEntries.map((entry) => {
            const isCurrentlyPlaying = playingChar === entry.char;
            const isCurrentlyCopied = copiedChar === entry.char;

            return (
              <div
                key={`${entry.category}-${entry.char}`}
                className={`group relative p-3.5 rounded-xl border bg-slate-950/70 transition-all flex flex-col justify-between ${
                  isCurrentlyPlaying
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Character & Category label */}
                <div className="flex items-start justify-between">
                  <div className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {entry.char}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {entry.category === 'thai-consonants' ? 'พยัญชนะ' : entry.category === 'thai-vowels' ? 'สระ' : entry.category === 'english' ? 'EN' : entry.category === 'numbers' ? 'NUM' : 'SYM'}
                  </span>
                </div>

                {/* Morse code pattern */}
                <div className="my-2.5">
                  <div className="text-amber-400 font-morse text-base tracking-widest font-semibold">
                    {entry.morse}
                  </div>
                  {/* Visual dots and dashes representation */}
                  <div className="flex items-center gap-1 mt-1">
                    {entry.morse.split('').map((sym, sIdx) => (
                      <span
                        key={sIdx}
                        className={`h-1 rounded-full ${
                          sym === '.'
                            ? 'w-1.5 bg-amber-400/80'
                            : 'w-4 bg-amber-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Action buttons: Play sound & Copy */}
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handlePlayChar(entry)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-[11px] ${
                      isCurrentlyPlaying
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="ฟังเสียงเคาะ CW"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>ฟัง</span>
                  </button>

                  <button
                    onClick={() => handleCopyMorse(entry)}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                    title="คัดลอกรหัส"
                  >
                    {isCurrentlyCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            ไม่พบอักขระหรือรหัสที่ตรงกับ &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
