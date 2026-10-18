import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAlgorithm, getAllAlgorithms } from '../registry';

function DemoPage() {
  const { algoId } = useParams<{ algoId: string }>();

  if (!algoId) {
    return <Navigate to="/" replace />;
  }

  const algorithm = getAlgorithm(algoId);

  if (!algorithm) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-32 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">Not found</p>
        <h1 className="font-display text-4xl text-ink">We couldn’t find that one</h1>
        <p className="mt-4 text-ink-soft">There’s no demo called “{algoId}” yet.</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper"
        >
          <ArrowLeft size={16} />
          Back to the collection
        </Link>
      </div>
    );
  }

  const all = getAllAlgorithms();
  const index = all.findIndex((a) => a.id === algorithm.id);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;
  const AlgorithmComponent = algorithm.component;

  return (
    <div key={algorithm.id}>
      {/* Intro */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 md:px-8 md:pb-12 md:pt-14">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-1.5 text-sm text-ink-mute transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          Collection
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: algorithm.theme.accent }} />
              No. {String(index + 1).padStart(2, '0')}
            </p>
            <h1 className="font-display text-5xl tracking-tight text-ink md:text-6xl">{algorithm.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft md:text-xl">{algorithm.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {algorithm.usedIn.map((use) => (
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

      {/* Next */}
      {next && (
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">Up next</p>
                <p className="mt-1 font-display text-3xl text-ink">{next.name}</p>
                <p className="mt-1 text-ink-soft">{next.tagline}</p>
              </div>
            </div>
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:translate-x-1"
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
