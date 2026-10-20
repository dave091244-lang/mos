/**
 * Morse Code Dictionaries for English, Thai, Numbers, and International Symbols
 * Grounded in user-provided specification and standard telegraph conventions.
 */

export const MORSE_CODE_DICT: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/'
};

export const THAI_MORSE_DICT: Record<string, string> = {
  'ก': '-.', 'ข': '.-..', 'ค': '-.-', 'ฆ': '-.-', 'ง': '---',
  'จ': '.---', 'ฉ': '..-.', 'ช': '-.-', 'ซ': '...', 'ฌ': '-.-',
  'ญ': '-.--', 'ฎ': '-..', 'ฏ': '-.-.', 'ฐ': '..-.', 'ฑ': '-..',
  'ฒ': '-..', 'ณ': '-.', 'ด': '-..', 'ต': '-', 'ถ': '.-..',
  'ท': '-', 'ธ': '-', 'น': '-.', 'บ': '-...', 'ป': '.--.',
  'ผ': '..-.', 'ฝ': '...-', 'พ': '.--', 'ฟ': '..-.', 'ภ': '.--',
  'ม': '--', 'ย': '-.--', 'ร': '.-.', 'ล': '.-..', 'ว': '.--',
  'ศ': '...', 'ษ': '...', 'ส': '...', 'ห': '....', 'ฬ': '.-..',
  'อ': '---', 'ฮ': '....',
  // สระและวรรณยุกต์ (แปลงเทียบเสียงใกล้เคียง)
  'ะ': '..', 'า': '.-', 'ิ': '..', 'ี': '..', 'ึ': '..',
  'ื': '.-', 'ุ': '..', 'ู': '..', 'เ': '.', 'แ': '..',
  'โ': '---', 'ใ': '.-', 'ไ': '.-', 'ั': '..', 'ำ': '.-.',
  '์': '..', '่': '.', '้': '..', '๊': '...', '๋': '....',
  'ๆ': '..', 'ฯ': '.-.-'
};

// Thai character groups for learning & dictionary
export const THAI_CONSONANTS = [
  'ก', 'ข', 'ค', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ',
  'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ',
  'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ',
  'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ',
  'อ', 'ฮ'
];

export const THAI_VOWELS_TONES = [
  'ะ', 'า', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', 'เ', 'แ',
  'โ', 'ใ', 'ไ', 'ั', 'ำ', '์', '่', '้', '๊', '๋',
  'ๆ', 'ฯ'
];

export const ENGLISH_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export const SYMBOLS = [
  '.', ',', '?', "'", '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'
];

// Reverse lookups
export const MORSE_TO_ENGLISH: Record<string, string> = {};
for (const [char, code] of Object.entries(MORSE_CODE_DICT)) {
  if (char !== ' ') {
    MORSE_TO_ENGLISH[code] = char;
  }
}

export const MORSE_TO_THAI: Record<string, string> = {};
// For Thai reverse, multiple Thai characters map to same morse; we store representative or list
export const MORSE_TO_THAI_LIST: Record<string, string[]> = {};
for (const [char, code] of Object.entries(THAI_MORSE_DICT)) {
  if (!MORSE_TO_THAI[code]) {
    MORSE_TO_THAI[code] = char;
  }
  if (!MORSE_TO_THAI_LIST[code]) {
    MORSE_TO_THAI_LIST[code] = [];
  }
  MORSE_TO_THAI_LIST[code].push(char);
}

export interface CharBreakdown {
  index: number;
  char: string;
  morse: string;
  isKnown: boolean;
  isThai: boolean;
  isSpace: boolean;
}

/**
 * Converts text (Thai, English, numbers, symbols) into Morse code string
 * Matching user's Python logic with structured metadata for animation.
 */
export function textToMorseWithMeta(text: string): {
  morse: string;
  breakdown: CharBreakdown[];
} {
  const breakdown: CharBreakdown[] = [];
  const morseTokens: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const rawChar = text[i];
    const upperChar = rawChar.toUpperCase();

    if (rawChar === ' ') {
      breakdown.push({
        index: i,
        char: ' ',
        morse: '/',
        isKnown: true,
        isThai: false,
        isSpace: true,
      });
      morseTokens.push('/');
    } else if (upperChar in MORSE_CODE_DICT) {
      const code = MORSE_CODE_DICT[upperChar];
      breakdown.push({
        index: i,
        char: upperChar,
        morse: code,
        isKnown: true,
        isThai: false,
        isSpace: false,
      });
      morseTokens.push(code);
    } else if (rawChar in THAI_MORSE_DICT) {
      const code = THAI_MORSE_DICT[rawChar];
      breakdown.push({
        index: i,
        char: rawChar,
        morse: code,
        isKnown: true,
        isThai: true,
        isSpace: false,
      });
      morseTokens.push(code);
    } else {
      breakdown.push({
        index: i,
        char: rawChar,
        morse: '?',
        isKnown: false,
        isThai: false,
        isSpace: false,
      });
      morseTokens.push('?');
    }
  }

  return {
    morse: morseTokens.join(' '),
    breakdown,
  };
}

/**
 * Standard user function text_to_morse
 */
export function textToMorse(text: string): string {
  return textToMorseWithMeta(text).morse;
}

/**
 * Decodes Morse string to text (handles / or 3+ spaces for word boundaries)
 */
export function morseToText(morse: string, languagePreference: 'auto' | 'thai' | 'english' = 'auto'): string {
  if (!morse.trim()) return '';

  // Clean input
  const words = morse.trim().split(/\s*\/\s*|\s{3,}/);

  const decodedWords = words.map((word) => {
    const letters = word.trim().split(/\s+/);
    return letters
      .map((code) => {
        if (!code) return '';
        if (code === '/') return ' ';

        if (languagePreference === 'thai') {
          return MORSE_TO_THAI[code] || MORSE_TO_ENGLISH[code] || '?';
        }
        if (languagePreference === 'english') {
          return MORSE_TO_ENGLISH[code] || MORSE_TO_THAI[code] || '?';
        }

        // Auto: Prefer English unless specifically requested, or numbers/punctuations
        return MORSE_TO_ENGLISH[code] || MORSE_TO_THAI[code] || '?';
      })
      .join('');
  });

  return decodedWords.join(' ');
}

export interface PresetPhrase {
  id: string;
  label: string;
  thaiLabel: string;
  text: string;
  category: 'emergency' | 'radio' | 'thai' | 'common';
}

export const PRESET_PHRASES: PresetPhrase[] = [
  { id: 'sos', label: 'SOS', thaiLabel: 'รหัสขอความช่วยเหลือฉุกเฉิน', text: 'SOS', category: 'emergency' },
  { id: 'sawasdee', label: 'สวัสดี', thaiLabel: 'คำทักทายภาษาไทย', text: 'สวัสดี', category: 'thai' },
  { id: 'khobkhun', label: 'ขอบคุณ', thaiLabel: 'แสดงความขอบคุณ', text: 'ขอบคุณ', category: 'thai' },
  { id: 'cq', label: 'CQ CQ CQ', thaiLabel: 'รหัสเรียกหาสถานีวิทยุสมัครเล่น', text: 'CQ CQ CQ', category: 'radio' },
  { id: 'iloveyou', label: 'I LOVE YOU', thaiLabel: 'ฉันรักคุณ', text: 'I LOVE YOU', category: 'common' },
  { id: 'thailand', label: 'THAILAND', thaiLabel: 'ประเทศไทย', text: 'THAILAND', category: 'common' },
  { id: 'mayday', label: 'MAYDAY', thaiLabel: 'สัญญาณภัยพิบัติสากล', text: 'MAYDAY', category: 'emergency' },
  { id: '73', label: '73 (Best Regards)', thaiLabel: 'ขอส่งความปรารถนาดี (วิทยุ)', text: '73', category: 'radio' },
];
