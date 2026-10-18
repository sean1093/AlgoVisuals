import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, LocateFixed } from 'lucide-react';
import { encode, decode } from './logic';
import { cellSizeKm, clampLat, formatDistance, sizeComparison, wrapLng } from './format';
import WorldMap from './WorldMap';
import CloseUp from './CloseUp';
import Slider from '../../components/shared/Slider';
import Panel from '../../components/shared/Panel';
import GuideSteps from '../../components/shared/GuideSteps';
import Rich from '../../components/shared/Rich';
import { useI18n } from '../../i18n';

const ACCENT = 'var(--color-clay)';
const SOFT = 'var(--color-clay-soft)';
const START = { lat: 25.033, lng: 121.565 };

const PLACES = [
  { id: 'taipei', lat: 25.033, lng: 121.565 },
  { id: 'tokyo', lat: 35.676, lng: 139.65 },
  { id: 'paris', lat: 48.857, lng: 2.352 },
  { id: 'newYork', lat: 40.713, lng: -74.006 },
  { id: 'saoPaulo', lat: -23.551, lng: -46.633 },
  { id: 'sydney', lat: -33.869, lng: 151.209 },
] as const;

const round = (n: number) => Number(n.toFixed(4));

function GeoHashVisualizer() {
  const { t } = useI18n();
  const tg = t.geohash;
  const [precision, setPrecision] = useState(4);
  const [lat, setLat] = useState(START.lat);
  const [lng, setLng] = useState(START.lng);
  const [showNeighbors, setShowNeighbors] = useState(true);
  const [copied, setCopied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [progress, setProgress] = useState({ moved: false, zoomed: false, neighbor: false });

  const geohash = encode(lat, lng, precision);
  const { bounds } = decode(geohash);
  const size = cellSizeKm(bounds);

  const moveTo = (newLat: number, newLng: number) => {
    setLat(round(clampLat(newLat)));
    setLng(round(wrapLng(newLng)));
    setProgress((p) => ({ ...p, moved: true }));
  };

  const handlePrecision = (value: number) => {
    setPrecision(value);
    if (value >= 6) setProgress((p) => ({ ...p, zoomed: true }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(geohash);
      setCopied(true);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); nothing else to do
    }
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        moveTo(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const done = [progress.moved, progress.zoomed, progress.neighbor];
  const steps = tg.steps.map((step, i) => ({ ...step, done: done[i] }));
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Map + code */}
          <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">{tg.yourCode}</p>
                <div className="flex items-center gap-1.5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {geohash.split('').map((char, i) => (
                      <motion.span
                        key={`${i}-${char}`}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="flex h-11 w-9 items-center justify-center rounded-xl font-mono text-2xl md:h-12 md:w-10"
                        style={{
                          backgroundColor: SOFT,
                          color: ACCENT,
                          opacity: 0.55 + (0.45 * (i + 1)) / geohash.length,
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink"
                    aria-label={tg.copyCode}
                    title={tg.copyCode}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-ink-soft">
                  <Rich text={tg.covers(formatDistance(size.width), formatDistance(size.height))} />
                </p>
                <p className="mt-0.5 text-[13px] text-ink-mute">{tg.roughly(tg.sizes[sizeComparison(Math.max(size.width, size.height))])}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-paper/60">
              <WorldMap lat={lat} lng={lng} bounds={bounds} firstChar={geohash[0]} onPick={moveTo} />
            </div>
            <p className="mt-3 px-1 text-[13px] text-ink-mute">
              {tg.worldNote}
            </p>
          </div>

          <Panel eyebrow={tg.closeUp} title={tg.closeUpTitle}>
            <div className="overflow-hidden rounded-2xl border border-line bg-paper/60">
              <CloseUp
                geohash={geohash}
                lat={lat}
                lng={lng}
                showNeighbors={showNeighbors}
                onPick={(pLat, pLng, isNeighbor) => {
                  moveTo(pLat, pLng);
                  if (isNeighbor) setProgress((p) => ({ ...p, neighbor: true }));
                }}
              />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">
              <Rich text={tg.closeUpNote} />
            </p>
          </Panel>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <Panel eyebrow={t.common.tryThis} title={allDone ? t.common.gotIt : t.common.threeExperiments}>
            <GuideSteps steps={steps} accent={ACCENT} />
            {allDone && (
              <p className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
                {tg.allDone}
              </p>
            )}
          </Panel>

          <Panel eyebrow={t.common.adjust}>
            <div className="space-y-6">
              <Slider
                label={tg.codeLength}
                hint={tg.codeLengthHint}
                value={precision}
                min={1}
                max={8}
                onChange={handlePrecision}
                minLabel={tg.minLabel}
                maxLabel={tg.maxLabel}
                accent={ACCENT}
              />

              <div>
                <p className="mb-2.5 text-sm font-medium text-ink">{tg.jumpTo}</p>
                <div className="flex flex-wrap gap-2">
                  {PLACES.map((place) => {
                    const active = Math.abs(place.lat - lat) < 1e-6 && Math.abs(place.lng - lng) < 1e-6;
                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => moveTo(place.lat, place.lng)}
                        className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                          active ? 'border-transparent text-on-accent' : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
                        }`}
                        style={active ? { backgroundColor: ACCENT } : undefined}
                      >
                        {tg.places[place.id]}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleLocate}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:text-ink"
                  >
                    <LocateFixed size={13} className={locating ? 'animate-spin' : ''} />
                    {tg.whereIAm}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">{tg.showNeighbours}</span>
                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    checked={showNeighbors}
                    onChange={(e) => setShowNeighbors(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>

              <details className="group border-t border-line pt-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                  <span className="inline-block transition-transform group-open:rotate-90">›</span> {tg.exactCoordinates}
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <CoordField label={tg.latitude} value={lat} min={-90} max={90} onCommit={(v) => moveTo(v, lng)} />
                  <CoordField label={tg.longitude} value={lng} min={-180} max={180} onCommit={(v) => moveTo(lat, v)} />
                </div>
              </details>
            </div>
          </Panel>

          <Panel eyebrow={tg.letterByLetter} title={tg.everyLetter}>
            <ol className="space-y-2.5">
              {geohash.split('').map((char, i) => {
                const prefix = geohash.slice(0, i + 1);
                const s = cellSizeKm(decode(prefix).bounds);
                const widest = Math.max(s.width, s.height);
                // Log scale so the bar shrinks visibly at every step
                const pct = Math.max(4, (Math.log10(widest * 1000) / Math.log10(5_000_000)) * 100);
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-mono text-sm"
                      style={{ backgroundColor: SOFT, color: ACCENT }}
                    >
                      {char}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: ACCENT, opacity: 0.7 }}
                          animate={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 flex-shrink-0 text-right text-[13px] tabular-nums text-ink-soft">
                      {formatDistance(widest)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-mute">
              {tg.lettersNote}
            </p>
          </Panel>
        </div>
      </div>

      {/* The idea */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel eyebrow={t.common.ideaInAMinute} title={tg.ideaTitle}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            {tg.idea.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Panel>
        <Panel eyebrow={t.common.whereUsed} title={tg.usedTitle}>
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>{tg.used}</p>
            <p className="text-[13px] text-ink-mute">{tg.usedNote}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

interface CoordFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}

/**
 * Number field that lets you type freely and only applies valid values
 */
function CoordField({ label, value, min, max, onCommit }: CoordFieldProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const n = Number(text);
    if (text.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) {
      onCommit(n);
    } else {
      setText(String(value));
    }
  };

  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-mute">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.001"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="h-10 w-full rounded-xl border border-line bg-paper/50 px-3 font-mono text-sm text-ink transition-colors focus:border-ink focus:outline-none"
      />
    </label>
  );
}

export default GeoHashVisualizer;
