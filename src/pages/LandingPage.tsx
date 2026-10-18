import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MousePointerClick, Sparkles, Lightbulb } from 'lucide-react';
import { CATEGORIES, getAlgorithmsByCategory, getAllAlgorithms } from '../registry';
import HeroSortLoop from '../components/shared/HeroSortLoop';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const STEPS = [
  {
    icon: Sparkles,
    title: 'Pick an idea',
    body: 'Each page is one idea, explained in a sentence you can actually remember.',
  },
  {
    icon: MousePointerClick,
    title: 'Play with it',
    body: 'Press play, step through slowly, or change the input. The picture reacts instantly — nothing to install, no code to read.',
  },
  {
    icon: Lightbulb,
    title: 'See it click',
    body: 'A short checklist guides you to the “aha” moment, then tells you where it shows up in real life.',
  },
];

function LandingPage() {
  const algorithms = getAllAlgorithms();
  const first = algorithms[0];
  const categories = CATEGORIES.filter((c) => getAlgorithmsByCategory(c.id).length);

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
            {algorithms.length} interactive demos · {categories.length} topics · free
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl"
          >
            See how algorithms <em className="font-normal italic text-clay">think.</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            No code, no formulas. Press play, step through slowly, and watch an idea take shape in front of
            you — each one takes about two minutes to get.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
            {first && (
              <Link
                to={`/demo/${first.id}`}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper shadow-card transition-all hover:bg-ink/85"
              >
                Start with {first.name}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <a
              href="#collection"
              className="inline-flex h-12 items-center rounded-full px-5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
            >
              Browse the collection
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-[#e3e6f3]/80 blur-2xl md:-inset-6" />
          <div className="rounded-[2rem] border border-line bg-card p-7 shadow-lift">
            <HeroSortLoop className="h-56" />
            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <div>
                <p className="font-display text-lg text-ink">Insertion Sort</p>
                <p className="text-xs text-ink-mute">Sorting a fresh list, over and over</p>
              </div>
              <span className="rounded-full bg-[#e3e6f3] px-3 py-1 text-xs font-medium text-[#4a5a9c]">Live</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Topic jump links */}
      <nav aria-label="Topics" className="mx-auto max-w-6xl px-5 pb-14 md:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.theme.accent }} />
              {c.name}
              <span className="text-xs text-ink-mute">{getAlgorithmsByCategory(c.id).length}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Collection, by topic */}
      <section id="collection" className="scroll-mt-20 border-t border-line/70 bg-card/40">
        <div className="mx-auto max-w-6xl space-y-20 px-5 py-20 md:px-8 md:py-24">
          {categories.map((category, ci) => {
            const items = getAlgorithmsByCategory(category.id);
            return (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.theme.accent }} />
                      Topic {String(ci + 1).padStart(2, '0')}
                    </p>
                    <h2 className="font-display text-4xl tracking-tight text-ink">{category.name}</h2>
                  </div>
                  <p className="max-w-md text-ink-soft">{category.blurb}</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((algo, i) => {
                    const Preview = algo.preview;
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
                            <h3 className="font-display text-2xl text-ink">{algo.name}</h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{algo.tagline}</p>
                            {algo.facts && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {algo.facts.map((f) => (
                                  <span key={f.label} className="rounded-md bg-paper-deep/70 px-2 py-0.5 text-[11px] text-ink-soft">
                                    {f.label} <span className="font-mono text-ink">{f.value}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            <span
                              className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium"
                              style={{ color: algo.theme.accent }}
                            >
                              Open the demo
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
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <h2 className="mb-12 max-w-xl font-display text-3xl tracking-tight text-ink md:text-4xl">
          Built for curious people, not just engineers.
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
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
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
