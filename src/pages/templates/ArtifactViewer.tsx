import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { placeholder } from '@/config/site';
import { SEO } from '@/components/common/SEO';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Artifact {
  id: string;
  name: string;
  period: string;
  year: number;
  origin: string;
  material: string;
  dimensions: string;
  collection: string;
  description: string;
  image: string;
  modelUrl: string;
  curator_note: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Restored';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL_URL = '/models/AdvancedExport/3DModel_Custom.gltf';

const COLLECTION_HUES: Record<string, number> = {
  'Ancient Greek': 220,
  Roman: 350,
  Egyptian: 45,
  Medieval: 280,
};

const CONDITION_COLORS: Record<Artifact['condition'], string> = {
  Excellent: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  Good: 'bg-blue-900/60 text-blue-300 border-blue-700',
  Fair: 'bg-amber-900/60 text-amber-300 border-amber-700',
  Restored: 'bg-purple-900/60 text-purple-300 border-purple-700',
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const ARTIFACTS: Artifact[] = [
  {
    id: 'amphora',
    name: 'Attic Red-Figure Amphora',
    period: '500 BCE',
    year: -500,
    origin: 'Athens, Greece',
    material: 'Clay',
    dimensions: '45 × 30 × 30 cm',
    collection: 'Ancient Greek',
    description:
      'A masterfully crafted amphora depicting scenes of athletic competition from the Panathenaic Games. The red-figure technique reveals extraordinary detail in the musculature and drapery of the figures, showcasing the pinnacle of Athenian ceramic artistry.',
    image: placeholder(600, 400, 'Attic Red-Figure Amphora', 220),
    modelUrl: MODEL_URL,
    curator_note:
      'Acquired in 1923 from a private collection in Naples. The vessel retains much of its original painted surface, a rarity for works of this period.',
    condition: 'Good',
  },
  {
    id: 'marble-bust',
    name: 'Marble Bust of Athena',
    period: '4th Century BCE',
    year: -350,
    origin: 'Delphi, Greece',
    material: 'Marble',
    dimensions: '62 × 35 × 28 cm',
    collection: 'Ancient Greek',
    description:
      'A refined portrait bust of the goddess Athena, distinguished by her iconic crested helmet and serene expression. The sculptor demonstrates mastery of the Classical Greek idealized style with subtle asymmetries that lend the face a lifelike quality.',
    image: placeholder(600, 400, 'Marble Bust of Athena', 220),
    modelUrl: MODEL_URL,
    curator_note:
      'Minor restoration to the nose completed in 1987. Traces of original polychrome pigment were identified under UV analysis.',
    condition: 'Restored',
  },
  {
    id: 'bronze-helmet',
    name: 'Corinthian Bronze Helmet',
    period: '6th Century BCE',
    year: -550,
    origin: 'Corinth, Greece',
    material: 'Bronze',
    dimensions: '30 × 22 × 25 cm',
    collection: 'Ancient Greek',
    description:
      'An exceptionally preserved Corinthian-type helmet with characteristic nose guard and cheek plates. Battle damage on the left temple suggests this was not merely ceremonial but saw active combat use.',
    image: placeholder(600, 400, 'Corinthian Bronze Helmet', 220),
    modelUrl: MODEL_URL,
    curator_note:
      'Recovered from an archaeological excavation at Olympia in 1956. The patina has been stabilised but otherwise left untouched.',
    condition: 'Fair',
  },
  {
    id: 'mosaic-fragment',
    name: 'Dionysian Mosaic Fragment',
    period: '1st Century CE',
    year: 50,
    origin: 'Pompeii, Italy',
    material: 'Stone tesserae',
    dimensions: '120 × 90 × 4 cm',
    collection: 'Roman',
    description:
      'A large section of a floor mosaic depicting Dionysus riding a panther, surrounded by grapevines and satyrs. The polychrome tesserae, some as small as 3 mm, demonstrate the opus vermiculatum technique at its finest.',
    image: placeholder(600, 400, 'Dionysian Mosaic Fragment', 350),
    modelUrl: MODEL_URL,
    curator_note:
      'Salvaged from a villa in Pompeii before the 1943 bombing. This fragment represents approximately one-third of the original composition.',
    condition: 'Good',
  },
  {
    id: 'gladiator-sword',
    name: 'Gladius of Legio IX',
    period: '2nd Century CE',
    year: 150,
    origin: 'Rome, Italy',
    material: 'Iron and bone',
    dimensions: '65 × 6 × 4 cm',
    collection: 'Roman',
    description:
      'A Roman short sword (gladius) bearing the stamp of the Ninth Legion on its tang. The bone grip retains carved decorative lines and the blade, though corroded, shows evidence of expert metallurgical craftsmanship.',
    image: placeholder(600, 400, 'Gladius of Legio IX', 350),
    modelUrl: MODEL_URL,
    curator_note:
      'Discovered near Eboracum (modern York) in 1876. The inscription has been verified against known Legio IX Hispana records.',
    condition: 'Fair',
  },
  {
    id: 'canopic-jar',
    name: 'Canopic Jar of Imsety',
    period: '1200 BCE',
    year: -1200,
    origin: 'Thebes, Egypt',
    material: 'Alabaster',
    dimensions: '38 × 16 × 16 cm',
    collection: 'Egyptian',
    description:
      'A finely carved canopic jar with a human-headed stopper representing the son of Horus, Imsety, guardian of the liver. Hieroglyphic inscriptions around the body invoke Isis and offer prayers for the deceased.',
    image: placeholder(600, 400, 'Canopic Jar of Imsety', 45),
    modelUrl: MODEL_URL,
    curator_note:
      'Part of a complete set of four jars. The remaining three are held by the Cairo Museum. Provenance traced to the tomb of a minor noble.',
    condition: 'Excellent',
  },
  {
    id: 'scarab-amulet',
    name: 'Heart Scarab Amulet',
    period: '1000 BCE',
    year: -1000,
    origin: 'Luxor, Egypt',
    material: 'Green jasper',
    dimensions: '8 × 5 × 3 cm',
    collection: 'Egyptian',
    description:
      'A large heart scarab carved from vivid green jasper, inscribed on its flat underside with Chapter 30B of the Book of the Dead. The spell beseeches the heart not to testify against the deceased during the weighing of the heart ceremony.',
    image: placeholder(600, 400, 'Heart Scarab Amulet', 45),
    modelUrl: MODEL_URL,
    curator_note:
      'The quality of the jasper and the precision of the hieroglyphs suggest a royal or high-priestly commissioner.',
    condition: 'Excellent',
  },
  {
    id: 'illuminated-manuscript',
    name: 'Book of Hours Leaf',
    period: '1400 CE',
    year: 1400,
    origin: 'Bruges, Flanders',
    material: 'Vellum, gold leaf, pigment',
    dimensions: '28 × 20 × 0.3 cm',
    collection: 'Medieval',
    description:
      'A single illuminated leaf from a Flemish Book of Hours featuring a miniature of the Annunciation set within an elaborate acanthus-leaf border. The palette includes lapis lazuli blue, vermillion, and generous gold leaf.',
    image: placeholder(600, 400, 'Book of Hours Leaf', 280),
    modelUrl: MODEL_URL,
    curator_note:
      'Attributed to the circle of the Master of Mary of Burgundy. Acquired from the estate of a Belgian collector in 2004.',
    condition: 'Good',
  },
];

const COLLECTIONS = [...new Set(ARTIFACTS.map((a) => a.collection))];

const TIMELINE_LABELS = [
  { label: '1500 BCE', year: -1500 },
  { label: '1000 BCE', year: -1000 },
  { label: '500 BCE', year: -500 },
  { label: '0', year: 0 },
  { label: '500 CE', year: 500 },
  { label: '1000 CE', year: 1000 },
  { label: '1500 CE', year: 1500 },
];

const TIMELINE_MIN = -1500;
const TIMELINE_MAX = 1500;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function yearToPercent(year: number): number {
  return ((year - TIMELINE_MIN) / (TIMELINE_MAX - TIMELINE_MIN)) * 100;
}

function uniqueMaterials(artifacts: Artifact[]): number {
  return new Set(artifacts.map((a) => a.material)).size;
}

function averageAge(artifacts: Artifact[]): number {
  const currentYear = 2026;
  const total = artifacts.reduce((sum, a) => sum + (currentYear - a.year), 0);
  return Math.round(total / artifacts.length);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CollectionTabs({
  active,
  onSelect,
  counts,
}: {
  active: string;
  onSelect: (c: string) => void;
  counts: Record<string, number>;
}) {
  const tabs = ['All Collections', ...COLLECTIONS];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
      {tabs.map((tab) => {
        const isActive = tab === active;
        const count = tab === 'All Collections' ? ARTIFACTS.length : (counts[tab] ?? 0);
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {tab}
            <span className="ml-2 text-xs opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function Timeline({
  artifacts,
  selectedId,
  onSelect,
}: {
  artifacts: Artifact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const sorted = useMemo(() => [...artifacts].sort((a, b) => a.year - b.year), [artifacts]);

  return (
    <div className="relative w-full overflow-x-auto py-8">
      <div className="relative min-w-[700px] mx-auto h-24">
        {/* Main line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-700" />

        {/* Epoch labels */}
        {TIMELINE_LABELS.map((tl) => (
          <div
            key={tl.label}
            className="absolute top-full -translate-x-1/2 text-xs text-zinc-500 mt-2"
            style={{ left: `${yearToPercent(tl.year)}%` }}
          >
            <div className="w-px h-3 bg-zinc-700 mx-auto mb-1" />
            {tl.label}
          </div>
        ))}

        {/* Artifact dots */}
        {sorted.map((a) => {
          const isSelected = a.id === selectedId;
          return (
            <button
              key={a.id}
              title={`${a.name} (${a.period})`}
              onClick={() => onSelect(a.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${yearToPercent(a.year)}%`, top: '50%' }}
            >
              <span
                className={`block h-3.5 w-3.5 rounded-full border-2 transition-all ${
                  isSelected
                    ? 'bg-amber-400 border-amber-300 scale-125'
                    : 'bg-zinc-800 border-amber-500/60 hover:bg-amber-500/40 hover:scale-110'
                }`}
              />
              {/* Tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col items-center">
                <img
                  src={a.image}
                  alt={a.name}
                  className="w-24 h-16 object-cover rounded border border-zinc-700"
                  loading="lazy"
                />
                <span className="mt-1 whitespace-nowrap rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200 border border-zinc-700">
                  {a.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: Artifact['condition'] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CONDITION_COLORS[condition]}`}
    >
      {condition}
    </span>
  );
}

function ArtifactDetail({ artifact }: { artifact: Artifact }) {
  const { t } = useTranslation();
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('@google/model-viewer')
      .then(() => {
        if (!cancelled) setViewerReady(true);
      })
      .catch((err: unknown) => {
        if (import.meta.env.DEV) {
          console.error('model-viewer load failed:', err instanceof Error ? err.message : err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid gap-8 lg:grid-cols-5 items-start">
      {/* 3D Viewer */}
      <div className="lg:col-span-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/3] relative">
        {viewerReady ? (
          <model-viewer
            src={artifact.modelUrl}
            alt={artifact.name}
            camera-controls
            auto-rotate
            shadow-intensity="1"
            poster={artifact.image}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={artifact.image}
              alt={artifact.name}
              className="max-h-full max-w-full object-contain"
              loading="eager"
            />
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="lg:col-span-2 space-y-5">
        <h2 className="font-serif text-3xl tracking-tight text-zinc-50">{artifact.name}</h2>

        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-300 border border-amber-500/30">
            {artifact.collection}
          </span>
          <ConditionBadge condition={artifact.condition} />
        </div>

        {/* Metadata grid */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-zinc-500 mb-0.5">{t('tpl.artifact.period')}</dt>
            <dd className="text-zinc-100">
              {artifact.period} (
              {artifact.year > 0 ? `${artifact.year} CE` : `${Math.abs(artifact.year)} BCE`})
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 mb-0.5">{t('tpl.artifact.origin')}</dt>
            <dd className="text-zinc-100 flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-amber-400 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {artifact.origin}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 mb-0.5">{t('tpl.artifact.material')}</dt>
            <dd className="text-zinc-100">{artifact.material}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 mb-0.5">{t('tpl.artifact.dimensions')}</dt>
            <dd className="text-zinc-100">{artifact.dimensions}</dd>
          </div>
        </dl>

        <p className="text-sm leading-relaxed text-zinc-300">{artifact.description}</p>

        {/* Curator note */}
        <blockquote className="border-l-2 border-amber-500/40 pl-4 py-2">
          <p className="text-sm italic text-zinc-400 leading-relaxed">{artifact.curator_note}</p>
          <cite className="mt-1 block text-xs text-zinc-500 not-italic">
            &mdash; {t('tpl.artifact.curatorNote')}
          </cite>
        </blockquote>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
              />
            </svg>
            {t('tpl.artifact.viewInAR')}
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-750 hover:text-zinc-100 transition-colors">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
      </div>
    </section>
  );
}

function ArtifactCard({
  artifact,
  isSelected,
  onSelect,
}: {
  artifact: Artifact;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const hue = COLLECTION_HUES[artifact.collection] ?? 200;

  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left rounded-xl overflow-hidden border transition-all ${
        isSelected
          ? 'border-amber-500/50 ring-1 ring-amber-500/20 bg-zinc-900'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/80'
      }`}
    >
      <div className="aspect-[3/2] overflow-hidden">
        <img
          src={placeholder(600, 400, artifact.name, hue)}
          alt={artifact.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-serif text-lg text-zinc-100 leading-snug">{artifact.name}</h3>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{artifact.period}</span>
          <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-zinc-300">
            {artifact.collection}
          </span>
        </div>
      </div>
    </button>
  );
}

function StatsBar({ artifacts }: { artifacts: Artifact[] }) {
  const sorted = [...artifacts].sort((a, b) => a.year - b.year);
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const formatYear = (y: number) => (y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`);

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg bg-zinc-900/80 border border-zinc-800 px-5 py-3 text-sm">
      <div>
        <span className="text-zinc-500">Artifacts </span>
        <span className="text-zinc-100 font-medium">{artifacts.length}</span>
      </div>
      <div>
        <span className="text-zinc-500">Time Span </span>
        <span className="text-zinc-100 font-medium">
          {formatYear(oldest.year)} &ndash; {formatYear(newest.year)}
        </span>
      </div>
      <div>
        <span className="text-zinc-500">Materials </span>
        <span className="text-zinc-100 font-medium">{uniqueMaterials(artifacts)}</span>
      </div>
      <div>
        <span className="text-zinc-500">Avg. Age </span>
        <span className="text-zinc-100 font-medium">
          {averageAge(artifacts).toLocaleString()} yrs
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

function ArtifactViewer() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeCollection, setActiveCollection] = useState('All Collections');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Collection counts
  const collectionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of ARTIFACTS) {
      map[a.collection] = (map[a.collection] ?? 0) + 1;
    }
    return map;
  }, []);

  // Filtered artifacts
  const filtered = useMemo(
    () =>
      activeCollection === 'All Collections'
        ? ARTIFACTS
        : ARTIFACTS.filter((a) => a.collection === activeCollection),
    [activeCollection]
  );

  // Selected artifact
  const selectedArtifact = useMemo(
    () => (selectedId ? (ARTIFACTS.find((a) => a.id === selectedId) ?? null) : null),
    [selectedId]
  );

  // Reset selection when collection changes (if selected artifact not in new filter)
  useEffect(() => {
    if (selectedId && !filtered.some((a) => a.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  // Log project context in dev
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn('[ArtifactViewer] project id:', id);
    }
  }, [id]);

  return (
    <>
      <SEO
        title="Virtual Museum Collection"
        description="Explore museum artifacts in immersive 3D with detailed provenance and curator notes."
      />

      <div className="min-h-screen bg-zinc-950">
        {/* ---- Museum Header ---- */}
        <header className="border-b border-zinc-800 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="font-serif text-4xl tracking-tight text-zinc-50 sm:text-5xl">
              {t('tpl.artifact.heading')}
            </h1>
            <p className="mt-2 text-lg text-zinc-400">{t('tpl.artifact.subtitle')}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {ARTIFACTS.length} artifacts across {COLLECTIONS.length} collections
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* ---- Stats Bar ---- */}
          <StatsBar artifacts={filtered} />

          {/* ---- Collection Tabs ---- */}
          <CollectionTabs
            active={activeCollection}
            onSelect={setActiveCollection}
            counts={collectionCounts}
          />

          {/* ---- Timeline ---- */}
          <section>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Timeline
            </h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-2">
              <Timeline artifacts={filtered} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </section>

          {/* ---- Artifact Detail ---- */}
          {selectedArtifact && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 lg:p-8">
              <ArtifactDetail artifact={selectedArtifact} />
            </section>
          )}

          {/* ---- Artifact Grid ---- */}
          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
              {activeCollection === 'All Collections' ? 'All Artifacts' : activeCollection}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <ArtifactCard
                  key={a.id}
                  artifact={a}
                  isSelected={a.id === selectedId}
                  onSelect={() => setSelectedId(a.id)}
                />
              ))}
            </div>
          </section>
        </main>

        {/* ---- Footer ---- */}
        <footer className="border-t border-zinc-800 mt-12">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-zinc-600">
              Virtual Museum Collection &middot; All artifact data is for demonstration purposes
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ArtifactViewer;
