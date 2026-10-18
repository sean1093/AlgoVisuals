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

const ACCENT = '#c0553a';
const SOFT = '#f5e1d8';
const START = { lat: 25.033, lng: 121.565 };

const PLACES = [
  { name: 'Taipei', lat: 25.033, lng: 121.565 },
  { name: 'Tokyo', lat: 35.676, lng: 139.65 },
  { name: 'Paris', lat: 48.857, lng: 2.352 },
  { name: 'New York', lat: 40.713, lng: -74.006 },
  { name: 'São Paulo', lat: -23.551, lng: -46.633 },
  { name: 'Sydney', lat: -33.869, lng: 151.209 },
];

const round = (n: number) => Number(n.toFixed(4));

function GeoHashVisualizer() {
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

  const steps = [
    {
      title: 'Pick a place',
      detail: 'Click anywhere on the map, or choose one of the cities below.',
      done: progress.moved,
    },
    {
      title: 'Make the code longer',
      detail: 'Drag “Code length” to 6 or more. Each extra letter zooms in about 32 times.',
      done: progress.zoomed,
    },
    {
      title: 'Step into a neighbour',
      detail: 'In the close-up, click a box next to yours. Notice how its code starts the same way.',
      done: progress.neighbor,
    },
  ];
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Map + code */}
          <div className="rounded-3xl border border-line bg-card p-4 shadow-card md:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-1">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-mute">Your code</p>
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
                    aria-label="Copy code"
                    title="Copy code"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-ink-soft">
                  Covers about <b className="text-ink">{formatDistance(size.width)}</b> ×{' '}
                  <b className="text-ink">{formatDistance(size.height)}</b>
                </p>
                <p className="mt-0.5 text-[13px] text-ink-mute">roughly the size of {sizeComparison(Math.max(size.width, size.height))}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-paper/60">
              <WorldMap lat={lat} lng={lng} bounds={bounds} firstChar={geohash[0]} onPick={moveTo} />
            </div>
            <p className="mt-3 px-1 text-[13px] text-ink-mute">
              The world is first cut into 32 big tiles — the faint letters. Your code always starts with the
              tile you’re in.
            </p>
          </div>

          <Panel eyebrow="Close-up" title="Your box and its neighbours">
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
              Grey letters are shared with your code; <span style={{ color: ACCENT }}>orange</span> ones differ.
              The small letters inside your box are the choices for the next character.
            </p>
          </Panel>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <Panel eyebrow="Try this" title={allDone ? 'You’ve got it!' : 'Three small experiments'}>
            <GuideSteps steps={steps} accent={ACCENT} />
            {allDone && (
              <p className="mt-5 rounded-2xl p-4 text-[13px] leading-relaxed text-ink-soft" style={{ backgroundColor: SOFT }}>
                Close places usually share a beginning. So “find everything near me” becomes “find codes that
                start with these letters” — something databases are very fast at.
              </p>
            )}
          </Panel>

          <Panel eyebrow="Adjust">
            <div className="space-y-6">
              <Slider
                label="Code length"
                hint="More letters, smaller area"
                value={precision}
                min={1}
                max={8}
                onChange={handlePrecision}
                minLabel="1 · continent"
                maxLabel="8 · a house"
                accent={ACCENT}
              />

              <div>
                <p className="mb-2.5 text-sm font-medium text-ink">Jump to</p>
                <div className="flex flex-wrap gap-2">
                  {PLACES.map((place) => {
                    const active = Math.abs(place.lat - lat) < 1e-6 && Math.abs(place.lng - lng) < 1e-6;
                    return (
                      <button
                        key={place.name}
                        type="button"
                        onClick={() => moveTo(place.lat, place.lng)}
                        className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                          active ? 'border-transparent text-white' : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
                        }`}
                        style={active ? { backgroundColor: ACCENT } : undefined}
                      >
                        {place.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleLocate}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:text-ink"
                  >
                    <LocateFixed size={13} className={locating ? 'animate-spin' : ''} />
                    Where I am
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">Show neighbours</span>
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
                  <span className="inline-block transition-transform group-open:rotate-90">›</span> Exact coordinates
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <CoordField label="Latitude" value={lat} min={-90} max={90} onCommit={(v) => moveTo(v, lng)} />
                  <CoordField label="Longitude" value={lng} min={-180} max={180} onCommit={(v) => moveTo(lat, v)} />
                </div>
              </details>
            </div>
          </Panel>

          <Panel eyebrow="Read it letter by letter" title="Every letter zooms in">
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
              Behind the scenes, each letter packs five yes/no answers: “east or west half?”, “north or south
              half?” — over and over.
            </p>
          </Panel>
        </div>
      </div>

      {/* The idea */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel eyebrow="The idea in a minute" title="Halve, halve, halve again">
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>
              Ask: is the place in the east or west half of the world? Then: north or south half of that?
              Keep alternating. Every answer is a 0 or a 1.
            </p>
            <p>
              Group the answers five at a time and write each group as one letter. That string of letters is
              the GeoHash — a nested address, from “this part of the planet” down to “this doorstep”.
            </p>
          </div>
        </Panel>
        <Panel eyebrow="Where it’s used" title="“What’s near me?” in one lookup">
          <div className="space-y-3 leading-relaxed text-ink-soft">
            <p>
              Ride-hailing apps, delivery services and nearby-search features store each location’s code.
              To find what’s close, they look up everything that starts with the same few letters —
              plus the 8 neighbours, because a place right on the edge of a box may have a different code.
            </p>
            <p className="text-[13px] text-ink-mute">
              That’s why the close-up shows the neighbours: they’re the boxes you’d search too.
            </p>
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
