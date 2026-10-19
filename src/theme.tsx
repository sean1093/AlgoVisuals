import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';
/** What the visitor picked; 'system' follows the OS setting */
export type ThemePreference = Theme | 'system';

// The inline script in index.html repeats this key and these colours to theme the page before React loads
const STORAGE_KEY = 'algovisuals.theme';
const META_COLORS: Record<Theme, string> = { light: '#f6f3ec', dark: '#161513' };

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeValue {
  /** The theme actually shown */
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeValue>({ theme: 'light', preference: 'system', setPreference: () => {} });

/**
 * Light / dark / follow-system theme. 'system' is stored as no saved value, so the
 * inline script in index.html can apply the right theme before first paint.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Theme | null>(readSaved);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = saved ?? system;

  // Keep following the system while there is no explicit choice
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = () => setSystem(media.matches ? 'dark' : 'light');
    // Safari < 14 only has the older addListener API
    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener(onChange);
    };
  }, []);

  // Pick up a choice made in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSaved(readSaved());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme]);
  }, [theme]);

  const setPreference = useCallback((preference: ThemePreference) => {
    setSaved(preference === 'system' ? null : preference);
    try {
      if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Not persisted; the choice still applies for this visit
    }
  }, []);

  const value = useMemo(
    () => ({ theme, preference: saved ?? ('system' as const), setPreference }),
    [theme, saved, setPreference]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
