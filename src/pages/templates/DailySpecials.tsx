import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import {
  X,
  Clock,
  Flame,
  Star,
  Eye,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Box,
} from 'lucide-react';
import { placeholder } from '@/config/site';
import { SEO } from '@/components/common/SEO';
import { DishCardContent, tagStyle } from '@/components/common/DishCardContent';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SpecialItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  originalPrice?: string;
  image: string;
  tags: string[];
  availableUntil: string;
  isFeatured: boolean;
  modelUrl: string;
}

interface DaySchedule {
  day: string;
  items: SpecialItem[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MODEL_URL = '/models/AdvancedExport/3DModel_Custom.gltf';

const _DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function futureToday(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours, 0, 0, 0);
  return d.toISOString();
}

function calcDiscount(original: string, current: string): number {
  const o = parseFloat(original.replace('$', ''));
  const c = parseFloat(current.replace('$', ''));
  if (o <= 0) return 0;
  return Math.round(((o - c) / o) * 100);
}

function useCountdown(isoTarget: string): { h: string; m: string; s: string; expired: boolean } {
  const compute = useCallback(() => {
    const diff = Math.max(0, new Date(isoTarget).getTime() - Date.now());
    const totalSec = Math.floor(diff / 1000);
    return {
      h: String(Math.floor(totalSec / 3600)).padStart(2, '0'),
      m: String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
      s: String(totalSec % 60).padStart(2, '0'),
      expired: diff <= 0,
    };
  }, [isoTarget]);

  const [time, setTime] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setTime(compute()), 1000);
    return () => clearInterval(id);
  }, [compute]);

  return time;
}

// tagStyle imported from @/components/common/DishCardContent

// ─── Mock Data ──────────────────────────────────────────────────────────────

const WEEKLY_SPECIALS: DaySchedule[] = [
  {
    day: 'Sunday',
    items: [
      {
        id: 'sun-1',
        name: 'Truffle Mushroom Risotto',
        desc: 'Arborio rice slow-cooked with porcini mushrooms, finished with black truffle oil and aged parmesan.',
        price: '$22',
        originalPrice: '$28',
        image: placeholder(400, 300, 'Special', 35),
        tags: ['Vegetarian', "Chef's Pick"],
        availableUntil: futureToday(6),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'sun-2',
        name: 'Herb-Crusted Lamb Chops',
        desc: 'New Zealand lamb rack with rosemary-garlic crust, served with roasted root vegetables.',
        price: '$34',
        image: placeholder(400, 300, 'Special', 15),
        tags: ['Premium'],
        availableUntil: futureToday(5),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
  {
    day: 'Monday',
    items: [
      {
        id: 'mon-1',
        name: 'Seared Ahi Tuna Bowl',
        desc: 'Sesame-crusted ahi tuna over jasmine rice with avocado, edamame, and ponzu dressing.',
        price: '$19',
        originalPrice: '$26',
        image: placeholder(400, 300, 'Special', 25),
        tags: ['New', "Chef's Pick"],
        availableUntil: futureToday(8),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'mon-2',
        name: 'Wild Mushroom Flatbread',
        desc: 'Crispy flatbread topped with mixed wild mushrooms, gruyere, and fresh thyme.',
        price: '$14',
        image: placeholder(400, 300, 'Special', 45),
        tags: ['Vegetarian'],
        availableUntil: futureToday(7),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
      {
        id: 'mon-3',
        name: 'Coconut Panna Cotta',
        desc: 'Silky coconut milk panna cotta with passion fruit coulis and toasted macadamia.',
        price: '$11',
        image: placeholder(400, 300, 'Special', 35),
        tags: ['Sweet'],
        availableUntil: futureToday(7),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
  {
    day: 'Tuesday',
    items: [
      {
        id: 'tue-1',
        name: 'Braised Short Rib Tacos',
        desc: 'Slow-braised beef short rib with pickled onion, cilantro-lime crema on corn tortillas.',
        price: '$17',
        originalPrice: '$22',
        image: placeholder(400, 300, 'Special', 15),
        tags: ['Comfort', "Chef's Pick"],
        availableUntil: futureToday(6),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'tue-2',
        name: 'Roasted Beet Salad',
        desc: 'Golden and ruby beets with goat cheese mousse, candied walnuts, and honey vinaigrette.',
        price: '$13',
        image: placeholder(400, 300, 'Special', 25),
        tags: ['Vegetarian', 'Seasonal'],
        availableUntil: futureToday(5),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
  {
    day: 'Wednesday',
    items: [
      {
        id: 'wed-1',
        name: 'Pan-Seared Duck Breast',
        desc: 'Five-spice duck breast with cherry reduction, roasted parsnips, and wilted greens.',
        price: '$29',
        originalPrice: '$36',
        image: placeholder(400, 300, 'Special', 15),
        tags: ['Premium', "Chef's Pick"],
        availableUntil: futureToday(7),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'wed-2',
        name: 'Lobster Mac & Cheese',
        desc: 'Maine lobster folded into creamy three-cheese sauce with truffle breadcrumb topping.',
        price: '$24',
        image: placeholder(400, 300, 'Special', 45),
        tags: ['Comfort'],
        availableUntil: futureToday(6),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
      {
        id: 'wed-3',
        name: 'Matcha Tiramisu',
        desc: 'Japanese-Italian fusion with matcha-soaked ladyfingers, mascarpone cream, and white chocolate.',
        price: '$12',
        image: placeholder(400, 300, 'Special', 35),
        tags: ['New', 'Sweet'],
        availableUntil: futureToday(6),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
  {
    day: 'Thursday',
    items: [
      {
        id: 'thu-1',
        name: 'Grilled Octopus',
        desc: 'Charred Spanish octopus with smoked paprika, fingerling potatoes, and romesco sauce.',
        price: '$26',
        originalPrice: '$32',
        image: placeholder(400, 300, 'Special', 25),
        tags: ['Seasonal', "Chef's Pick"],
        availableUntil: futureToday(8),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'thu-2',
        name: 'Spicy Miso Ramen',
        desc: 'Rich pork bone broth with hand-pulled noodles, chashu pork, soft egg, and chili oil.',
        price: '$18',
        image: placeholder(400, 300, 'Special', 15),
        tags: ['Spicy', 'Hearty'],
        availableUntil: futureToday(7),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
  {
    day: 'Friday',
    items: [
      {
        id: 'fri-1',
        name: 'Wagyu Beef Burger',
        desc: 'A5 wagyu patty with aged cheddar, caramelized onions, house-made truffle aioli on brioche.',
        price: '$28',
        originalPrice: '$35',
        image: placeholder(400, 300, 'Special', 15),
        tags: ['Premium', "Chef's Pick"],
        availableUntil: futureToday(9),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'fri-2',
        name: 'Crispy Calamari',
        desc: 'Lightly battered calamari with lemon aioli and marinara, served with arugula.',
        price: '$15',
        image: placeholder(400, 300, 'Special', 45),
        tags: ['Classic'],
        availableUntil: futureToday(8),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
      {
        id: 'fri-3',
        name: 'Molten Chocolate Cake',
        desc: 'Dark chocolate fondant with a liquid center, served with vanilla bean ice cream.',
        price: '$14',
        image: placeholder(400, 300, 'Special', 25),
        tags: ['Sweet', "Chef's Pick"],
        availableUntil: futureToday(8),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
  {
    day: 'Saturday',
    items: [
      {
        id: 'sat-1',
        name: 'Surf & Turf Platter',
        desc: 'Grilled filet mignon paired with butter-poached lobster tail, asparagus, and bearnaise.',
        price: '$45',
        originalPrice: '$58',
        image: placeholder(400, 300, 'Special', 15),
        tags: ['Premium', "Chef's Pick"],
        availableUntil: futureToday(10),
        isFeatured: true,
        modelUrl: MODEL_URL,
      },
      {
        id: 'sat-2',
        name: 'Truffle Fries',
        desc: 'Hand-cut Kennebec potatoes with parmesan dust, fresh herbs, and black truffle oil.',
        price: '$12',
        image: placeholder(400, 300, 'Special', 35),
        tags: ['Vegetarian', 'Classic'],
        availableUntil: futureToday(9),
        isFeatured: false,
        modelUrl: MODEL_URL,
      },
    ],
  },
];

const RESTAURANT = {
  phone: '+1 555 0100',
  address: '12 Harbor Lane, Old Town',
};

// ─── CountdownDisplay ───────────────────────────────────────────────────────

const CountdownDisplay: React.FC<{ target: string; size?: 'sm' | 'lg' }> = ({
  target,
  size = 'sm',
}) => {
  const { t } = useTranslation();
  const { h, m, s, expired } = useCountdown(target);

  if (expired) {
    return <span className="text-red-400 text-xs font-medium">{t('tpl.specials.expired')}</span>;
  }

  const digitClass =
    size === 'lg'
      ? 'bg-zinc-800 px-3 py-2 rounded-lg text-2xl font-bold font-mono text-zinc-50 tabular-nums'
      : 'bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs font-bold font-mono text-zinc-100 tabular-nums';

  const separatorClass =
    size === 'lg' ? 'text-zinc-500 text-2xl font-bold mx-1' : 'text-zinc-500 text-xs mx-0.5';

  return (
    <span className="inline-flex items-center" aria-label={`${h}h ${m}m ${s}s remaining`}>
      <span className={digitClass}>{h}</span>
      <span className={separatorClass}>:</span>
      <span className={digitClass}>{m}</span>
      <span className={separatorClass}>:</span>
      <span className={digitClass}>{s}</span>
    </span>
  );
};

// ─── SpecialCard ────────────────────────────────────────────────────────────

interface SpecialCardProps {
  item: SpecialItem;
  onView3D: () => void;
  animDelay: number;
}

const SpecialCard: React.FC<SpecialCardProps> = ({ item, onView3D, animDelay }) => {
  const { t } = useTranslation();
  const discount = item.originalPrice ? calcDiscount(item.originalPrice, item.price) : 0;

  return (
    <article
      className="group bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="relative aspect-[4/3] bg-zinc-800 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {discount}% OFF
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            {t('tpl.specials.featured')}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950/80 to-transparent" />
      </div>

      <DishCardContent
        name={item.name}
        price={item.price}
        desc={item.desc}
        tags={item.tags}
        brandColor="#d97706"
        className="p-4"
      >
        {/* Price row with original price + countdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {item.originalPrice && (
              <span className="text-sm text-zinc-500 line-through font-mono">
                {item.originalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <CountdownDisplay target={item.availableUntil} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onView3D}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors active:scale-95"
          >
            <Box className="w-4 h-4" />
            {t('tpl.specials.viewIn3D')}
          </button>
          <button
            onClick={onView3D}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            {t('tpl.specials.viewInAR')}
          </button>
        </div>
      </DishCardContent>
    </article>
  );
};

// ─── ModelViewerModal ───────────────────────────────────────────────────────

interface ModelViewerModalProps {
  item: SpecialItem;
  onClose: () => void;
}

const ModelViewerModal: React.FC<ModelViewerModalProps> = ({ item, onClose }) => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('@google/model-viewer')
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch((err: unknown) => {
        if (import.meta.env.DEV) {
          const message = err instanceof Error ? err.message : String(err);
          console.warn('[DailySpecials] model-viewer import failed:', message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const handleAR = () => {
    const viewer = document.querySelector('model-viewer') as HTMLElement & {
      activateAR?: () => void;
    };
    viewer?.activateAR?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`3D viewer: ${item.name}`}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
          aria-label={t('tpl.specials.closeViewer')}
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-zinc-50 truncate mx-4">{item.name}</span>
        <button
          onClick={handleAR}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors active:scale-95"
        >
          <Smartphone className="w-4 h-4" />
          {t('tpl.specials.viewInAR')}
        </button>
      </div>

      <div
        className="flex-1 relative"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #27272a 0%, #09090b 70%)' }}
      >
        {loaded ? (
          <model-viewer
            src={item.modelUrl}
            alt={`3D model of ${item.name}`}
            auto-rotate
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            shadow-intensity="1"
            exposure="0.9"
            loading="eager"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 to-transparent p-6">
          <h3 className="text-lg font-bold text-zinc-50">{item.name}</h3>
          <p className="text-sm text-zinc-400 mt-1">{item.desc}</p>
        </div>
      </div>
    </div>
  );
};

// ─── DailySpecials ──────────────────────────────────────────────────────────

const DailySpecials: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [viewerItem, setViewerItem] = useState<SpecialItem | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const currentSchedule = WEEKLY_SPECIALS[selectedDay];
  const featuredItem = currentSchedule.items.find((i) => i.isFeatured) ?? currentSchedule.items[0];
  const yesterdayIndex = (todayIndex + 6) % 7;
  const tomorrowIndex = (todayIndex + 1) % 7;
  const yesterdaySchedule = WEEKLY_SPECIALS[yesterdayIndex];
  const tomorrowSchedule = WEEKLY_SPECIALS[tomorrowIndex];

  const handleDayChange = (dayIdx: number) => {
    setSelectedDay(dayIdx);
    setAnimKey((k) => k + 1);
  };

  // Scroll active tab into view
  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SEO title={t('tpl.specials.seoTitle')} description={t('tpl.specials.seoDesc')} />

      {/* ── Hero: Featured Special ── */}
      <section className="relative overflow-hidden" aria-label="Featured special of the day">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Hero Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl shadow-amber-900/10">
                <img
                  src={featuredItem.image}
                  alt={featuredItem.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Star className="w-3.5 h-3.5" />
                {t('tpl.specials.todaysFeatured')}
              </div>
            </div>

            {/* Hero Content */}
            <div className="w-full md:w-1/2 space-y-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-red-400 text-sm font-semibold tracking-wide">
                  {t('tpl.specials.limitedTime')}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-50 leading-tight">
                {featuredItem.name}
              </h1>

              <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                {featuredItem.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {featuredItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${tagStyle(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-amber-400 font-mono">
                  {featuredItem.price}
                </span>
                {featuredItem.originalPrice && (
                  <span className="text-xl text-zinc-500 line-through font-mono">
                    {featuredItem.originalPrice}
                  </span>
                )}
                {featuredItem.originalPrice && (
                  <span className="text-sm font-bold text-red-400">
                    {t('tpl.specials.save', {
                      percent: calcDiscount(featuredItem.originalPrice, featuredItem.price),
                    })}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                  {t('tpl.specials.availableFor')}
                </p>
                <CountdownDisplay target={featuredItem.availableUntil} size="lg" />
              </div>

              <button
                onClick={() => setViewerItem(featuredItem)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors active:scale-95 shadow-lg shadow-amber-900/30"
              >
                <Eye className="w-5 h-5" />
                {t('tpl.specials.viewIn3D')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Day Selector Tabs ── */}
      <nav
        className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50"
        aria-label="Select day"
      >
        <div
          ref={tabsRef}
          className="max-w-6xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto scrollbar-none py-2"
          role="tablist"
        >
          {WEEKLY_SPECIALS.map((schedule, idx) => {
            const isActive = selectedDay === idx;
            const isPast = idx < todayIndex;
            const isFuture = idx > todayIndex;
            const isToday = idx === todayIndex;
            const short = schedule.day.slice(0, 3);

            return (
              <button
                key={schedule.day}
                data-day={idx}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleDayChange(idx)}
                className={`relative flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                    : isPast
                      ? 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span className="font-semibold">{short}</span>
                <span className={`text-[10px] ${isActive ? 'text-amber-100' : 'text-zinc-500'}`}>
                  {schedule.items.length} item{schedule.items.length !== 1 ? 's' : ''}
                </span>
                {isToday && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
                {isFuture && !isActive && (
                  <span className="absolute -top-1.5 right-0 text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full border border-zinc-700">
                    {t('tpl.specials.preview')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Specials Grid ── */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-50">
              {currentSchedule.day}&apos;s Specials
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {currentSchedule.items.length} dish
              {currentSchedule.items.length !== 1 ? 'es' : ''} available
              {selectedDay === todayIndex ? ' today' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-zinc-400">
              {t('tpl.specials.updatedDaily')}
            </span>
          </div>
        </div>

        <div key={animKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentSchedule.items.map((item, idx) => (
            <SpecialCard
              key={item.id}
              item={item}
              onView3D={() => setViewerItem(item)}
              animDelay={idx * 80}
            />
          ))}
        </div>
      </main>

      {/* ── Archive Section ── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <button
          onClick={() => setArchiveOpen((v) => !v)}
          className="w-full flex items-center justify-between py-4 border-t border-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors group"
          aria-expanded={archiveOpen}
        >
          <span className="text-sm font-semibold">{t('tpl.specials.previousUpcoming')}</span>
          {archiveOpen ? (
            <ChevronUp className="w-5 h-5 group-hover:text-zinc-200" />
          ) : (
            <ChevronDown className="w-5 h-5 group-hover:text-zinc-200" />
          )}
        </button>

        {archiveOpen && (
          <div className="space-y-8 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Yesterday */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-bold text-zinc-400">
                  {yesterdaySchedule.day} {t('tpl.specials.yesterday')}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                  {t('tpl.specials.ended')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                {yesterdaySchedule.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-4 grayscale"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-400 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">{item.desc}</p>
                        <span className="text-xs text-zinc-500 font-mono mt-1 inline-block">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tomorrow */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-bold text-zinc-400">
                  {tomorrowSchedule.day} {t('tpl.specials.tomorrow')}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/40">
                  {t('tpl.specials.preview')}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tomorrowSchedule.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-4 backdrop-blur-sm"
                    style={{ filter: 'blur(2px)' }}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-zinc-100 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{item.desc}</p>
                        <span className="text-xs text-amber-400 font-mono mt-1 inline-block">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/project/${id}/menu`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors active:scale-95 shadow-lg shadow-amber-900/20"
            >
              {t('tpl.specials.viewFullMenu')}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-400">
            <a
              href={`tel:${RESTAURANT.phone}`}
              className="flex items-center gap-2 hover:text-zinc-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {RESTAURANT.phone}
            </a>
            <span className="hidden sm:block text-zinc-700">|</span>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(RESTAURANT.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-zinc-200 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {RESTAURANT.address}
            </a>
          </div>

          <p className="text-center text-zinc-700 text-xs font-mono">
            {t('tpl.specials.poweredBy')}
          </p>
        </div>
      </footer>

      {/* ── 3D Viewer Modal ── */}
      {viewerItem && <ModelViewerModal item={viewerItem} onClose={() => setViewerItem(null)} />}
    </div>
  );
};

export default DailySpecials;
