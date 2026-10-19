import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAlgorithm, getAlgorithmsByCategory, getAllAlgorithms, getCategory } from '../registry';
import { useI18n } from '../i18n';

function DemoPage() {
  const { algoId } = useParams<{ algoId: string }>();
  const { t } = useI18n();
  const text = algoId ? t.algorithms[algoId] : undefined;

  useEffect(() => {
    document.title = text ? t.meta.demoTitle(text.name) : t.meta.title;
    return () => {
      document.title = t.meta.title;
    };
  }, [text, t]);

  if (!algoId) {
    return <Navigate to="/" replace />;
  }

  const algorithm = getAlgorithm(algoId);

  if (!algorithm || !text) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{t.demo.notFound}</p>
        <h1 className="font-display text-4xl text-ink">{t.demo.notFoundTitle}</h1>
        <p className="mt-4 text-ink-soft">{t.demo.notFoundBody(algoId)}</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper"
        >
          <ArrowLeft size={16} />
          {t.demo.backToCollection}
        </Link>
      </div>
    );
  }

  const all = getAllAlgorithms();
  const index = all.findIndex((a) => a.id === algorithm.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;
  const category = getCategory(algorithm.category);
  const siblings = getAlgorithmsByCategory(algorithm.category);
  const AlgorithmComponent = algorithm.component;
  const categoryName = t.categories[category.id].name;
  const nextText = next && t.algorithms[next.id];

  return (
    <div key={algorithm.id}>
      {/* Intro */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 md:px-8 md:pb-12 md:pt-14">
        <nav aria-label={t.demo.breadcrumb} className="mb-8 flex items-center gap-1.5 text-sm text-ink-mute">
          <Link to="/" className="group inline-flex items-center gap-1.5 transition-colors hover:text-ink">
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            {t.demo.collection}
          </Link>
          <span>/</span>
          <Link to={`/#${category.shelf}`} className="hidden transition-colors hover:text-ink sm:inline">
            {t.shelves[category.shelf].name}
          </Link>
          <span className="hidden sm:inline">/</span>
          <Link to={`/#${category.id}`} className="transition-colors hover:text-ink">
            {categoryName}
          </Link>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: algorithm.theme.accent }} />
              {categoryName}
            </p>
            <h1 className="font-display text-5xl tracking-tight text-ink md:text-6xl">{text.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft md:text-xl">{text.tagline}</p>
            {text.facts.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {text.facts.map(([label, value]) => (
                  <span key={label} className="rounded-lg border border-line bg-card/70 px-2.5 py-1 text-xs text-ink-soft">
                    {label} <span className="ml-1 font-mono text-ink">{value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {text.usedIn.map((use) => (
              <span key={use} className="rounded-full border border-line bg-card/70 px-3 py-1 text-xs text-ink-soft">
                {use}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Playground */}
      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <AlgorithmComponent />
      </section>

      {/* More in this topic */}
      {siblings.length > 1 && (
        <section className="mx-auto max-w-6xl px-5 pb-8 md:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{t.demo.moreIn(categoryName)}</p>
          <div className="flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.id}
                to={`/demo/${s.id}`}
                aria-current={s.id === algorithm.id ? 'page' : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  s.id === algorithm.id ? 'border-transparent text-on-accent' : 'border-line bg-card/70 text-ink-soft hover:border-line-strong hover:text-ink'
                }`}
                style={s.id === algorithm.id ? { backgroundColor: category.theme.accent } : undefined}
              >
                {t.algorithms[s.id].name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Next */}
      {next && nextText && (
        <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
          <Link
            to={`/demo/${next.id}`}
            className="group flex items-center justify-between gap-6 rounded-3xl border border-line bg-card p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift md:p-9"
          >
            <div className="flex items-center gap-6">
              <div className="hidden h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl sm:flex" style={{ backgroundColor: next.theme.soft }}>
                <next.preview className="h-14 w-14 text-ink" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{t.demo.upNext}</p>
                <p className="mt-1 font-display text-3xl text-ink">{nextText.name}</p>
                <p className="mt-1 text-ink-soft">{nextText.tagline}</p>
              </div>
            </div>
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-on-accent transition-transform group-hover:translate-x-1"
              style={{ backgroundColor: next.theme.accent }}
            >
              <ArrowRight size={20} />
            </span>
          </Link>
        </section>
      )}
    </div>
  );
}

export default DemoPage;
