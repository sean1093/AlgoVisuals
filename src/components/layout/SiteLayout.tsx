import { ReactNode, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getAllAlgorithms } from '../../registry';

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="AlgoVisuals home">
      <svg viewBox="0 0 32 32" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#1f1d1a" />
        <path d="M8 8h16v16H8zM16 8v16M8 16h8M16 12h8M20 8v8" fill="none" stroke="#f6f3ec" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="22" cy="20" r="2.2" fill="#c0553a" />
      </svg>
      <span className="hidden font-display text-xl tracking-tight text-ink min-[400px]:inline">AlgoVisuals</span>
    </Link>
  );
}

function SiteHeader() {
  const algorithms = getAllAlgorithms();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Logo />
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {algorithms.map((algo) => (
            <NavLink
              key={algo.id}
              to={`/demo/${algo.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-2.5 py-2 text-[13px] transition-colors sm:px-3.5 sm:text-sm ${
                  isActive ? 'bg-card text-ink shadow-card' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="h-2 w-2 rounded-full transition-opacity"
                    style={{ backgroundColor: algo.theme.accent, opacity: isActive ? 1 : 0.5 }}
                  />
                  {algo.name}
                </>
              )}
            </NavLink>
          ))}
          <a
            href="https://github.com/sean1093/AlgoVisuals"
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink sm:flex"
            aria-label="Source on GitHub"
          >
            <GithubMark />
          </a>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-10 text-sm text-ink-mute md:flex-row md:items-center md:px-8">
        <p>
          <span className="font-display text-base text-ink">AlgoVisuals</span>
          <span className="mx-2">·</span>
          Learn by touching, not by reading code.
        </p>
        <a
          href="https://github.com/sean1093/AlgoVisuals"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-ink"
        >
          Open source on GitHub
        </a>
      </div>
    </footer>
  );
}

/**
 * Shared page chrome: sticky header, content, footer
 */
function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="paper-grain flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export default SiteLayout;
