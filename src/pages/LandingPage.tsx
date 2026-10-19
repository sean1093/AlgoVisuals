import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MousePointerClick, Sparkles, Lightbulb } from 'lucide-react';
import { CATEGORIES, SHELVES, getAlgorithmsByCategory, getAllAlgorithms, getCategory } from '../registry';
import HeroSortLoop from '../components/shared/HeroSortLoop';
import { useI18n } from '../i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const STEP_ICONS = [Sparkles, MousePointerClick, Lightbulb];

function LandingPage() {
  const { t } = useI18n();
  const tl = t.landing;

  useEffect(() => {
    document.title = t.meta.title;
  }, [t]);
  const algorithms = getAllAlgorithms();
  // The hero shows sorting, so start there
  const first = algorithms.find((a) => a.id === 'bubble-sort') ?? algorithms[0];
  const categories = CATEGORIES.filter((c) => getAlgorithmsByCategory(c.id).length);
  const sortTheme = getCategory('sorting').theme;

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 md:grid-cols-[1.15fr_1fr] md:px-8 md:pb-24 md:pt-24">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }}>
          <motion.p
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3.5 py-1.5 text-xs font-medium text-ink-soft"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-clay" />
            {tl.badge(algorithms.length, categories.length)}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl"
          >
            {tl.titleStart}<em className="font-normal italic text-clay">{tl.titleEmphasis}</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            {tl.intro}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            {first && (
              <Link
                to={`/demo/${first.id}`}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper shadow-card transition-all hover:bg-ink/85"
              >
                {tl.start(t.algorithms[first.id].name)}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <a
              href="#collection"
              className="inline-flex h-12 items-center rounded-full px-5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
            >
              {tl.browseCollection}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-3 -z-10 rounded-[2.5rem] opacity-80 blur-2xl md:-inset-6" style={{ backgroundColor: sortTheme.soft }} />
          <div className="rounded-[2rem] border border-line bg-card p-7 shadow-lift">
            <HeroSortLoop className="h-56" />
            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <div>
                <p className="font-display text-lg text-ink">{t.algorithms['insertion-sort'].name}</p>
                <p className="text-xs text-ink-mute">{tl.heroCaption}</p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: sortTheme.soft, color: sortTheme.accent }}>
                {tl.live}
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Topic jump links, grouped by part */}
      <nav aria-label={tl.topics} className="mx-auto max-w-6xl space-y-4 px-5 pb-14 md:px-8">
        {SHELVES.map((shelf) => (
          <div key={shelf} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={`#${shelf}`}
              className="w-40 flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute transition-colors hover:text-ink"
            >
              {t.shelves[shelf].name}
            </a>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.shelf === shelf)
                .map((c) => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.theme.accent }} />
                    {t.categories[c.id].name}
                    <span className="text-xs text-ink-mute">{getAlgorithmsByCategory(c.id).length}</span>
                  </a>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collection: two parts, each with its topics */}
      <section id="collection" className="scroll-mt-20 border-t border-line/70 bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          {SHELVES.map((shelf, si) => (
          <div key={shelf} id={shelf} className={`scroll-mt-24 ${si > 0 ? 'mt-28 border-t border-line/70 pt-20' : ''}`}>
            <div className="mb-14 max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{tl.part(si + 1)}</p>
              <h2 className="font-display text-5xl tracking-tight text-ink md:text-6xl">{t.shelves[shelf].name}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">{t.shelves[shelf].blurb}</p>
            </div>
            <div className="space-y-16">
          {categories.filter((c) => c.shelf === shelf).map((category) => {
            const items = getAlgorithmsByCategory(category.id);
            return (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                  <h3 className="flex items-center gap-3 font-display text-3xl tracking-tight text-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.theme.accent }} />
                    {t.categories[category.id].name}
                  </h3>
                  <p className="max-w-md text-ink-soft">{t.categories[category.id].blurb}</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((algo, i) => {
                    const Preview = algo.preview;
                    const text = t.algorithms[algo.id];
                    return (
                      <motion.div
                        key={algo.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: Math.min(0.1 + i * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          to={`/demo/${algo.id}`}
                          className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                        >
                          <div className="flex h-40 items-center justify-center" style={{ backgroundColor: algo.theme.soft }}>
                            <Preview className="h-28 w-28 text-ink transition-transform duration-500 group-hover:scale-105" />
                          </div>
                          <div className="flex flex-1 flex-col p-6">
                            <h4 className="font-display text-2xl text-ink">{text.name}</h4>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{text.tagline}</p>
                            {text.facts.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {text.facts.map(([label, value]) => (
                                  <span key={label} className="rounded-md bg-paper-deep/70 px-2 py-0.5 text-[11px] text-ink-soft">
                                    {label} <span className="font-mono text-ink">{value}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            <span
                              className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium"
                              style={{ color: algo.theme.accent }}
                            >
                              {tl.openDemo}
                              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
            </div>
          </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <h2 className="mb-12 max-w-xl font-display text-3xl tracking-tight text-ink md:text-4xl">
          {tl.builtFor}
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {tl.steps.map(({ title, body }, i) => {
            const Icon = STEP_ICONS[i];
            return (
            <div key={title}>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-card text-ink">
                  <Icon size={18} />
                </span>
                <span className="font-display text-sm text-ink-mute">0{i + 1}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
              <p className="leading-relaxed text-ink-soft">{body}</p>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
