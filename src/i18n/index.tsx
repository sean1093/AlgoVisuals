import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import en, { Messages } from './en';
import zhTW from './zh-TW';
import ja from './ja';
import ko from './ko';

export type Lang = 'en' | 'zh-TW' | 'ja' | 'ko';

export const LANGUAGES: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'zh-TW', label: '繁體中文', short: '繁中' },
  { id: 'ja', label: '日本語', short: '日本語' },
  { id: 'ko', label: '한국어', short: '한국어' },
];

const DICTIONARIES: Record<Lang, Messages> = { en, 'zh-TW': zhTW, ja, ko };

// Noto fonts cover the CJK glyphs Fraunces and Inter don't have; loaded only when needed
const CJK_FONTS: Partial<Record<Lang, string>> = {
  'zh-TW': 'Noto+Sans+TC:wght@400;500;600&family=Noto+Serif+TC:wght@500;600',
  ja: 'Noto+Sans+JP:wght@400;500;600&family=Noto+Serif+JP:wght@500;600',
  ko: 'Noto+Sans+KR:wght@400;500;600&family=Noto+Serif+KR:wght@500;600',
};

const STORAGE_KEY = 'algovisuals.lang';

function readSaved(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in DICTIONARIES) return saved as Lang;
  } catch {
    // Storage can be blocked (private mode); fall back to the default
  }
  return 'en';
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
}

const I18nContext = createContext<I18nValue>({ lang: 'en', setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readSaved);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted; the choice still applies for this visit
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    const family = CJK_FONTS[lang];
    if (!family || document.getElementById(`font-${lang}`)) return;
    const link = document.createElement('link');
    link.id = `font-${lang}`;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
    document.head.appendChild(link);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: DICTIONARIES[lang] }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Messages };
