import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe, Moon, Sun } from 'lucide-react';
import { CATEGORIES, getAlgorithmsByCategory } from '../../registry';
import { LANGUAGES, useI18n } from '../../i18n';
import { useTheme } from '../../theme';

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function Logo() {
  const { t } = useI18n();
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={t.nav.homeLabel}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--color-ink)" />
        <path d="M8 8h16v16H8zM16 8v16M8 16h8M16 12h8M20 8v8" fill="none" stroke="var(--color-paper)" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="22" cy="20" r="2.2" fill="var(--color-clay)" />
      </svg>
      <span className="font-display text-xl tracking-tight text-ink">AlgoVisuals</span>
    </Link>
  );
}

/**
 * Close a popover on outside click and Escape
 */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = theme === 'dark' ? t.common.lightMode : t.common.darkMode;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function LanguageMenu() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  const current = LANGUAGES.find((l) => l.id === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t.common.language}
        title={t.common.language}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors ${
          open ? 'bg-card text-ink shadow-card' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{current.short}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            aria-label={t.common.language}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-lift"
          >
            {LANGUAGES.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  aria-pressed={l.id === lang}
                  lang={l.id}
                  onClick={() => {
                    setLang(l.id);
                    close();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    l.id === lang ? 'bg-paper-deep/70 font-medium text-ink' : 'text-ink-soft hover:bg-paper-deep/60 hover:text-ink'
                  }`}
                >
                  {l.label}
                  {l.id === lang && <Check size={15} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrowseMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  // Close on navigation too
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors ${
          open ? 'bg-card text-ink shadow-card' : 'text-ink-soft hover:text-ink'
        }`}
      >
        {t.nav.browse}
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full border-b border-line bg-paper/95 shadow-lift backdrop-blur-md"
          >
            <div className="mx-auto grid max-h-[75vh] max-w-6xl gap-x-8 gap-y-6 overflow-y-auto px-5 py-7 sm:grid-cols-2 md:px-8 lg:grid-cols-5">
              {CATEGORIES.map((category) => {
                const items = getAlgorithmsByCategory(category.id);
                if (!items.length) return null;
                return (
                  <div key={category.id}>
                    <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.theme.accent }} />
                      {t.categories[category.id].name}
                    </p>
                    <ul className="space-y-0.5">
                      {items.map((algo) => (
                        <li key={algo.id}>
                          <NavLink
                            to={`/demo/${algo.id}`}
                            className={({ isActive }) =>
                              `block rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                                isActive ? 'bg-card font-medium text-ink shadow-card' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
                              }`
                            }
                          >
                            {t.algorithms[algo.id].name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Logo />
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link
            to="/"
            className="hidden rounded-full px-3.5 py-2 text-sm text-ink-soft transition-colors hover:text-ink sm:block"
          >
            {t.nav.home}
          </Link>
          <BrowseMenu />
          <LanguageMenu />
          <ThemeToggle />
          <a
            href="https://github.com/sean1093/AlgoVisuals"
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink sm:flex"
            aria-label={t.nav.github}
          >
            <GithubMark />
          </a>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-10 text-sm text-ink-mute md:flex-row md:items-center md:px-8">
        <p>
          <span className="font-display text-base text-ink">AlgoVisuals</span>
          <span className="mx-2">·</span>
          {t.nav.footerTagline}
        </p>
        <a
          href="https://github.com/sean1093/AlgoVisuals"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-ink"
        >
          {t.nav.openSource}
        </a>
      </div>
    </footer>
  );
}

/**
 * Shared page chrome: sticky header, content, footer
 */
function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();

  // Scroll to top on navigation, or to the #section when the link has one
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="paper-grain flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export default SiteLayout;
