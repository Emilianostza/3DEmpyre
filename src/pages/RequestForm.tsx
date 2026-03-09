/**
 * Request Form — Free Quote Lead Capture
 *
 * 3-step wizard: Project → Details → Contact
 * Dark-themed, matches site design language (zinc-950, brand-600 accents)
 * Live cost estimate sidebar, session storage draft persistence
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocalizedLink as Link } from '@/components/LocalizedLink';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { Industry, RequestFormState } from '@/types';
import { ProjectStatus } from '@/types/domain';
import { SEO } from '@/components/common/SEO';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Globe,
  Code2,
  Smartphone,
  Package,
  QrCode,
  Receipt,
  MapPin,
  Camera,
  Sparkles,
  ShieldCheck,
  Lock,
  Clock,
  Crown,
  Zap,
  Star,
  Bot,
  User,
  Phone,
  MessageSquare,
  Send,
  Calendar as _Calendar,
  Info,
  X as XIcon,
} from 'lucide-react';
import { ProjectsProvider } from '@/services/dataProvider';

/* ─── Pricing Engine ─────────────────────────────────────────────────────── */
const QTY_RANGES: Record<string, [number, number]> = {
  '1-10': [1, 10],
  '11-20': [11, 20],
  '21-40': [21, 40],
  '40+': [40, 100],
};

const RESTAURANT_PLANS = [
  { name: 'Standard', monthly: 18, views: '1,000', storage: '1 GB', quality: 'Optimized quality' },
  { name: 'Pro', monthly: 35, views: '2,000', storage: '3 GB', quality: 'High quality' },
  { name: 'Ultra', monthly: 48, views: '3,000', storage: '8 GB', quality: 'Premium quality' },
];

const CAPTURE_RATES = {
  restaurant: { perItem: 20, onSiteVisit: 100 },
  general: { standard: 290, complex: 490, onSitePerDay: 900, itemsPerDay: 8 },
};

const batchDiscount = (qty: number) => (qty >= 100 ? 0.25 : qty >= 25 ? 0.2 : qty >= 10 ? 0.1 : 0);

const fmtEur = (n: number) => `\u20AC${Math.round(n).toLocaleString('en')}`;

/* ─── Initial State ──────────────────────────────────────────────────────── */
const INITIAL_STATE: RequestFormState = {
  industry: '',
  selected_plan: '',
  quantity_range: '',
  object_size_range: '',
  materials: [],
  location_mode: '',
  country: '',
  preferred_window: '',
  deliverables: [],
  contact: { full_name: '', email: '', company: '', phone: '' },
};

const STORAGE_KEY = 'managed_capture_request_draft';

/* ─── Valid Countries ─────────────────────────────────────────────────────── */
const VALID_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
  'Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad',
  'Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
  'Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea',
  'Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany',
  'Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan',
  'Jordan','Kazakhstan','Kenya','Kiribati','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia',
  'Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova',
  'Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan',
  'Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal',
  'Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia',
  'South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago',
  'Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia',
  'Zimbabwe',
] as const;

const COUNTRIES_LOWER = VALID_COUNTRIES.map((c) => c.toLowerCase());

/* ─── AI Assistant Scripted Flow ─────────────────────────────────────────── */

interface AIChatOption {
  label: string;
  value: string;
}

interface AIScriptedQuestion {
  id: string;
  aiMessage: string;
  options: AIChatOption[];
}

const AI_SCRIPT: AIScriptedQuestion[] = [
  {
    id: 'industry',
    aiMessage: "Hi! I'm your 3D capture assistant. Let me help you figure out exactly what you need. First — what industry are you in?",
    options: [
      { label: '🍽️ Restaurant / Food', value: 'Restaurant' },
      { label: '🏨 Hospitality / Hotels', value: 'Hospitality' },
      { label: '🛍️ Retail / Fashion', value: 'Retail' },
      { label: '🏠 Real Estate', value: 'RealEstate' },
      { label: '📦 Other / General', value: 'General' },
    ],
  },
  {
    id: 'scope',
    aiMessage: "Got it! And roughly how many items or spaces do you need captured in 3D?",
    options: [
      { label: 'Just a few (1–10)', value: '1-10' },
      { label: 'A collection (11–20)', value: '11-20' },
      { label: 'Large catalog (21–40+)', value: '21-40' },
      { label: "Not sure yet", value: 'unsure' },
    ],
  },
  {
    id: 'goal',
    aiMessage: "Great scope! What's your primary goal with 3D capture?",
    options: [
      { label: 'Interactive menu with AR', value: 'ar_menu' },
      { label: 'Virtual tours for my space', value: 'virtual_tours' },
      { label: '3D product showcase', value: 'product_showcase' },
      { label: 'E-commerce 3D models', value: 'ecommerce' },
      { label: 'Just exploring options', value: 'exploring' },
    ],
  },
  {
    id: 'timeline',
    aiMessage: "Almost there! What's your timeline looking like?",
    options: [
      { label: '⚡ ASAP — need it fast', value: 'asap' },
      { label: '📅 Within a month', value: 'month' },
      { label: '🕐 No rush, planning ahead', value: 'no_rush' },
      { label: '🔍 Just researching for now', value: 'researching' },
    ],
  },
];

function getAISummary(answers: Record<string, string>): string {
  const industry = answers.industry ?? 'your industry';
  const goalMap: Record<string, string> = {
    ar_menu: 'an interactive AR menu',
    virtual_tours: 'immersive virtual tours',
    product_showcase: 'a 3D product showcase',
    ecommerce: '3D e-commerce models',
    exploring: 'exploring 3D capture possibilities',
  };
  const goal = goalMap[answers.goal] ?? 'your 3D project';
  const timelineMap: Record<string, string> = {
    asap: "Since you're looking to move fast",
    month: 'With your timeline of about a month',
    no_rush: 'Since you have time to plan',
    researching: "Since you're in the research phase",
  };
  const timeline = timelineMap[answers.timeline] ?? 'Based on your needs';

  return `Perfect! Here's what I gathered:\n\nYou're in **${industry}** and looking to create **${goal}**. ${timeline}, I'd recommend getting a personalized quote from our team — or you can fill out the detailed form yourself for a faster estimate.`;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
const RequestForm: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { localePath } = useLocale();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RequestFormState>(INITIAL_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  // AI Assistant floating chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    { role: 'ai', text: AI_SCRIPT[0].aiMessage },
  ]);
  const [chatStep, setChatStep] = useState(0);
  const [chatAnswers, setChatAnswers] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showContactSales, setShowContactSales] = useState(false);
  const [salesForm, setSalesForm] = useState({ name: '', email: '', phone: '', time: '', message: '' });
  const [salesSubmitted, setSalesSubmitted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTypingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Clean up typing-indicator timer on unmount
  useEffect(() => {
    return () => {
      if (chatTypingTimerRef.current) clearTimeout(chatTypingTimerRef.current);
    };
  }, []);

  /* ─── Step labels ────────────────────────────────────────────────────────── */
  const STEPS = [
    { num: 1, label: t('requestForm.step.project') },
    { num: 2, label: t('requestForm.step.details') },
    { num: 3, label: t('requestForm.step.contact') },
  ] as const;

  const TOTAL_STEPS = STEPS.length;

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Handle AI chat answer
  const handleChatAnswer = (questionId: string, option: AIChatOption) => {
    const newAnswers = { ...chatAnswers, [questionId]: option.value };
    setChatAnswers(newAnswers);

    // Add user message
    setChatMessages((prev) => [...prev, { role: 'user', text: option.label }]);

    const nextStep = chatStep + 1;

    // Show typing indicator, then next question or summary
    setIsTyping(true);
    if (chatTypingTimerRef.current) clearTimeout(chatTypingTimerRef.current);
    chatTypingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (nextStep < AI_SCRIPT.length) {
        setChatStep(nextStep);
        setChatMessages((prev) => [...prev, { role: 'ai', text: AI_SCRIPT[nextStep].aiMessage }]);
      } else {
        // All questions answered — show summary
        const summary = getAISummary(newAnswers);
        setChatMessages((prev) => [...prev, { role: 'ai', text: summary }]);
        setChatStep(nextStep); // marks chat as done
      }
    }, 600 + Math.random() * 400);
  };

  // Pre-fill form from AI chat answers and close chat
  const handleContinueToForm = () => {
    const industryMap: Record<string, Industry> = {
      Restaurant: Industry.Restaurant,
      Hospitality: Industry.Hospitality,
      Retail: Industry.Retail,
      RealEstate: Industry.RealEstate,
      General: Industry.General,
    };
    const industry = industryMap[chatAnswers.industry] ?? '';
    const qtyMap: Record<string, string> = { '1-10': '1-10', '11-20': '11-20', '21-40': '21-40', unsure: '' };
    const qty = qtyMap[chatAnswers.scope] ?? '';

    setFormData((prev) => ({
      ...prev,
      ...(industry && { industry }),
      ...(qty && { quantity_range: qty }),
    }));
    setChatOpen(false);
    setStep(1);
    window.scrollTo(0, 0);
  };

  // Contact sales submit
  const handleSalesSubmit = () => {
    setSalesSubmitted(true);
  };

  /* ── Hydrate from storage / URL ── */
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        if (import.meta.env.DEV) console.error('Failed to parse saved draft');
      }
    }
    const params = new URLSearchParams(location.search);
    const ind = params.get('industry');
    if (ind === 'restaurants') {
      setFormData((prev) => ({ ...prev, industry: Industry.Restaurant }));
    } else if (ind === 'hospitality') {
      setFormData((prev) => ({ ...prev, industry: Industry.Hospitality }));
    } else if (ind === 'retail') {
      setFormData((prev) => ({ ...prev, industry: Industry.Retail }));
    } else if (ind === 'real-estate') {
      setFormData((prev) => ({ ...prev, industry: Industry.RealEstate }));
    }
  }, [location.search]);

  /* ── Persist on change ── */
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  /* ── Helpers ── */
  function updateField<K extends keyof RequestFormState>(field: K, value: RequestFormState[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const updateContact = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  };

  const toggleArrayField = (field: 'materials' | 'deliverables', value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value],
      };
    });
  };

  /* ── Validation ── */
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.industry) newErrors.industry = t('requestForm.errors.industry');
      if (!formData.selected_plan) newErrors.selected_plan = t('requestForm.errors.selectedPlan');
      if (!formData.quantity_range)
        newErrors.quantity_range = t('requestForm.errors.quantityRange');
      if (!formData.object_size_range)
        newErrors.object_size_range = t('requestForm.errors.objectSize');
    }

    if (currentStep === 2) {
      if (!formData.location_mode) newErrors.location_mode = t('requestForm.errors.locationMode');
      if (!formData.country.trim()) {
        newErrors.country = t('requestForm.errors.country');
      } else if (!COUNTRIES_LOWER.includes(formData.country.trim().toLowerCase())) {
        newErrors.country = t('requestForm.errors.countryInvalid', 'Please select a valid country');
      }
      if (formData.deliverables.length === 0)
        newErrors.deliverables = t('requestForm.errors.deliverables');
    }

    if (currentStep === 3) {
      if (!formData.contact.full_name.trim())
        newErrors.full_name = t('requestForm.errors.fullName');
      if (!formData.contact.email.trim()) {
        newErrors.email = t('requestForm.errors.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email)) {
        newErrors.email = t('requestForm.errors.emailInvalid');
      }
      if (!formData.contact.company.trim()) newErrors.company = t('requestForm.errors.company');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    try {
      setSubmitting(true);
      await ProjectsProvider.create({
        name: `${formData.industry} Capture Request`,
        client: formData.contact.company,
        type: 'standard',
        status: ProjectStatus.Pending,
        phone: formData.contact.phone,
        address: formData.country,
      });
      sessionStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to submit request', error);
      setErrors({ submit: t('requestForm.errors.submit') });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Estimate computation ── */
  const qtyRange = QTY_RANGES[formData.quantity_range];
  const [qtyLo, qtyHi] = qtyRange ?? [0, 0];
  const qtyMid = qtyRange ? Math.round((qtyLo + qtyHi) / 2) : 0;
  const hasQty = Boolean(qtyRange);
  const isCustomQty = formData.quantity_range === '40+';
  const isRestaurant = formData.industry === Industry.Restaurant;
  const isGeneral = formData.industry === Industry.General;
  const isComplex = ['large', 'oversized'].includes(formData.object_size_range);
  const isOnSite = formData.location_mode === 'on_site';

  const captureRate = isRestaurant
    ? CAPTURE_RATES.restaurant.perItem
    : isComplex
      ? CAPTURE_RATES.general.complex
      : CAPTURE_RATES.general.standard;

  const captureLoFull = hasQty ? Math.round(qtyLo * captureRate) : 0;
  const captureHiFull = hasQty ? Math.round(qtyHi * captureRate) : 0;
  const captureLo = hasQty ? Math.round(captureLoFull * (1 - batchDiscount(qtyLo))) : 0;
  const captureHi = hasQty ? Math.round(captureHiFull * (1 - batchDiscount(qtyHi))) : 0;
  const captureDiscountPct = hasQty ? Math.round(batchDiscount(qtyMid) * 100) : 0;

  const onSiteLo = isRestaurant
    ? CAPTURE_RATES.restaurant.onSiteVisit
    : Math.ceil(qtyLo / CAPTURE_RATES.general.itemsPerDay) * CAPTURE_RATES.general.onSitePerDay;
  const onSiteHi = isRestaurant
    ? CAPTURE_RATES.restaurant.onSiteVisit
    : Math.ceil(qtyHi / CAPTURE_RATES.general.itemsPerDay) * CAPTURE_RATES.general.onSitePerDay;

  const plan = formData.selected_plan
    ? (RESTAURANT_PLANS.find((p) => p.name === formData.selected_plan) ?? null)
    : null;

  const totalLo = captureLo + (isOnSite && hasQty ? onSiteLo : 0);
  const totalHi = captureHi + (isOnSite && hasQty ? onSiteHi : 0);
  const totalLoFull = captureLoFull + (isOnSite && hasQty ? onSiteLo : 0);
  const hasEstimate = (isRestaurant || isGeneral) && hasQty;

  /* ─── Success State ─────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div
        className="min-h-screen bg-zinc-950 flex items-center justify-center p-4"
        {...(import.meta.env.DEV && {
          'data-component': 'Request Form — Success',
          'data-file': 'src/pages/RequestForm.tsx',
        })}
      >
        <SEO
          title={t('requestForm.success.seo.title')}
          description={t('requestForm.success.seo.desc')}
        />

        <div className="max-w-lg w-full text-center">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full" />
          </div>

          <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-10 md:p-12">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>

            <h1 className="font-display text-3xl font-bold text-white mb-3">
              {t('requestForm.success.heading')}
            </h1>
            <p className="text-zinc-400 mb-8">
              {t('requestForm.success.thankYou', {
                name: formData.contact.full_name,
                industry: formData.industry?.toLowerCase(),
              })}
            </p>

            <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                {t('requestForm.success.whatsNext')}
              </h3>
              <div className="space-y-3">
                {[
                  t('requestForm.success.step1'),
                  t('requestForm.success.step2', { email: formData.contact.email }),
                  t('requestForm.success.step3'),
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-brand-400">{i + 1}</span>
                    </span>
                    <span className="text-sm text-zinc-400">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-emerald-400/80 mb-6 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              {t('requestForm.success.responseTime')}
            </p>

            <button
              onClick={() => navigate(localePath('/'))}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all hover:-translate-y-px hover:shadow-glow"
            >
              {t('requestForm.success.returnHome')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error display helper ── */
  const FieldError: React.FC<{ field: string }> = ({ field }) =>
    errors[field] ? (
      <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors[field]}
      </p>
    ) : null;

  /* ── Selection button helper ── */
  const SelectionButton: React.FC<{
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
  }> = ({ selected, onClick, children, className = '' }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-brand-500/60 bg-brand-500/5 shadow-[0_0_20px_rgba(234,88,12,0.08)]'
          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
      } ${className}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-brand-400" />
        </div>
      )}
      {children}
    </button>
  );

  /* ─── Main Form ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen bg-zinc-950"
      {...(import.meta.env.DEV && {
        'data-component': 'Request Form',
        'data-file': 'src/pages/RequestForm.tsx',
      })}
    >
      <SEO title={t('requestForm.seo.title')} description={t('requestForm.seo.desc')} />

      {/* ── Hero / Header ── */}
      <section data-section="hero" className="relative bg-zinc-950 overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 max-w-3xl text-center">
          <p className="inline-block text-xs font-bold uppercase tracking-widest text-brand-400 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            {t('requestForm.hero.badge')}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t('requestForm.hero.heading')}
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">{t('requestForm.hero.subtitle')}</p>
        </div>
      </section>

      {/* ── Progress Steps ── */}
      <div className="container mx-auto px-4 max-w-3xl mb-12">
        <div className="relative flex items-center justify-between">
          {/* Connecting line (background) */}
          <div className="absolute top-5 left-[calc(16.67%)] right-[calc(16.67%)] h-[2px] bg-zinc-800 rounded-full" />
          {/* Connecting line (filled progress) */}
          <div
            className="absolute top-5 left-[calc(16.67%)] h-[2px] bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 66.67}%` }}
          />

          {STEPS.map((s) => {
            const isActive = s.num === step;
            const isDone = s.num < step;
            const isFuture = s.num > step;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => { if (isDone) setStep(s.num); }}
                className={`relative z-10 flex flex-col items-center gap-2.5 group ${isDone ? 'cursor-pointer' : isFuture ? 'cursor-default' : ''}`}
              >
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-4 ring-brand-600/15'
                      : isDone
                        ? 'bg-emerald-500/15 text-emerald-400 border-2 border-emerald-500/30 group-hover:bg-emerald-500/25 group-hover:border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-600 border-2 border-zinc-800'
                  }`}
                >
                  {isDone ? <Check className="w-4.5 h-4.5" /> : s.num}
                </div>
                {/* Label */}
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    isActive
                      ? 'text-brand-400'
                      : isDone
                        ? 'text-emerald-400/80 group-hover:text-emerald-400'
                        : 'text-zinc-600'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form + Sidebar ── */}
      <div className="container mx-auto px-4 max-w-5xl pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* ── Left: Form Card ── */}
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <form onSubmit={handleSubmit}>
              {/* ═══ Step 1: Project ═══ */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">
                      {t('requestForm.step1.heading')}
                    </h2>
                    <p className="text-sm text-zinc-500">{t('requestForm.step1.desc')}</p>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {t('requestForm.step1.industryLabel')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        Industry.Restaurant,
                        Industry.Hospitality,
                        Industry.Retail,
                        Industry.RealEstate,
                        Industry.General,
                      ].map((ind) => (
                        <SelectionButton
                          key={ind}
                          selected={formData.industry === ind}
                          onClick={() => updateField('industry', ind)}
                        >
                          <span className="font-semibold text-white block mb-0.5">{ind}</span>
                          <span className="text-xs text-zinc-500">
                            {ind === Industry.Restaurant &&
                              t('requestForm.step1.industryRestaurant')}
                            {ind === Industry.Hospitality &&
                              t('requestForm.step1.industryHospitality')}
                            {ind === Industry.Retail && t('requestForm.step1.industryRetail')}
                            {ind === Industry.RealEstate &&
                              t('requestForm.step1.industryRealEstate')}
                            {ind === Industry.General && t('requestForm.step1.industryGeneral')}
                          </span>
                        </SelectionButton>
                      ))}
                    </div>
                    <FieldError field="industry" />
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      Choose Your Plan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {RESTAURANT_PLANS.map((p) => {
                        const selected = formData.selected_plan === p.name;
                        const isPro = p.name === 'Pro';
                        const isUltra = p.name === 'Ultra';
                        const PlanIcon = isUltra ? Crown : isPro ? Zap : Star;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => updateField('selected_plan', p.name as 'Standard' | 'Pro' | 'Ultra')}
                            className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                              selected
                                ? isPro
                                  ? 'border-brand-500/60 bg-brand-500/5 shadow-[0_0_20px_rgba(234,88,12,0.08)]'
                                  : isUltra
                                    ? 'border-purple-500/60 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.08)]'
                                    : 'border-brand-500/60 bg-brand-500/5 shadow-[0_0_20px_rgba(234,88,12,0.08)]'
                                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                            }`}
                          >
                            {isPro && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-brand-600 text-white whitespace-nowrap">
                                Most Popular
                              </span>
                            )}
                            {selected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-brand-400" />
                              </div>
                            )}
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                              selected
                                ? isUltra
                                  ? 'bg-purple-500/15 text-purple-400'
                                  : 'bg-brand-500/15 text-brand-400'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              <PlanIcon className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-bold text-white text-base block">{p.name}</span>
                            <div className="flex items-baseline gap-1 mt-1 mb-2">
                              <span className={`text-xl font-bold ${
                                selected
                                  ? isUltra ? 'text-purple-400' : 'text-brand-400'
                                  : 'text-white'
                              }`}>
                                €{p.monthly}
                              </span>
                              <span className="text-xs text-zinc-500">/mo</span>
                            </div>
                            <div className="space-y-1.5 mt-3 pt-3 border-t border-zinc-800/60">
                              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                {p.quality}
                              </p>
                              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                {p.views} views/mo
                              </p>
                              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                {p.storage} storage
                              </p>
                              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                Unlimited items
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError field="selected_plan" />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {t('requestForm.step1.quantityLabel')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['1-10', '11-20', '21-40', '40+'] as const).map((opt) => {
                        const selected = formData.quantity_range === opt;
                        const isCustom = opt === '40+';
                        const range = QTY_RANGES[opt];
                        const midQty = range ? Math.round((range[0] + range[1]) / 2) : 0;
                        const discount = isCustom ? 0 : Math.round(batchDiscount(midQty) * 100);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateField('quantity_range', opt)}
                            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                              selected
                                ? 'bg-brand-600/15 text-brand-400 border-brand-500/40'
                                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {opt}
                            {isCustom ? (
                              <span className="block text-[10px] font-bold text-amber-400 mt-0.5">
                                Custom discount
                              </span>
                            ) : discount > 0 ? (
                              <span className="block text-[10px] font-bold text-emerald-400 mt-0.5">
                                -{discount}%
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    <FieldError field="quantity_range" />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {t('requestForm.step1.sizeLabel')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: 'small',
                          label: t('requestForm.step1.sizeSmall'),
                          desc: t('requestForm.step1.sizeSmallDesc'),
                        },
                        {
                          value: 'medium',
                          label: t('requestForm.step1.sizeMedium'),
                          desc: t('requestForm.step1.sizeMediumDesc'),
                        },
                        {
                          value: 'large',
                          label: t('requestForm.step1.sizeLarge'),
                          desc: t('requestForm.step1.sizeLargeDesc'),
                        },
                        {
                          value: 'oversized',
                          label: t('requestForm.step1.sizeOversized'),
                          desc: t('requestForm.step1.sizeOversizedDesc'),
                        },
                      ].map((opt) => (
                        <SelectionButton
                          key={opt.value}
                          selected={formData.object_size_range === opt.value}
                          onClick={() => updateField('object_size_range', opt.value)}
                        >
                          <span className="font-semibold text-white text-sm block">
                            {opt.label}
                          </span>
                          <span className="text-xs text-zinc-500">{opt.desc}</span>
                        </SelectionButton>
                      ))}
                    </div>
                    <FieldError field="object_size_range" />
                  </div>
                </div>
              )}

              {/* ═══ Step 2: Details ═══ */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">
                      {t('requestForm.step2.heading')}
                    </h2>
                    <p className="text-sm text-zinc-500">{t('requestForm.step2.desc')}</p>
                  </div>

                  {/* Capture Location */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {t('requestForm.step2.captureLocationLabel')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SelectionButton
                        selected={formData.location_mode === 'on_site'}
                        onClick={() => updateField('location_mode', 'on_site')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/40 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-brand-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm block">
                              {t('requestForm.step2.onSite')}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {t('requestForm.step2.onSiteDesc')}
                            </span>
                          </div>
                        </div>
                      </SelectionButton>
                      <SelectionButton
                        selected={formData.location_mode === 'ship_in'}
                        onClick={() => updateField('location_mode', 'ship_in')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/40 flex items-center justify-center">
                            <Package className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm block">
                              {t('requestForm.step2.shipIn')}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {t('requestForm.step2.shipInDesc')}
                            </span>
                          </div>
                        </div>
                      </SelectionButton>
                    </div>
                    <FieldError field="location_mode" />
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country-input" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {t('requestForm.step2.countryLabel')}
                    </label>
                    <div className="relative">
                      <input
                        id="country-input"
                        type="text"
                        list="country-list"
                        role="combobox"
                        aria-autocomplete="list"
                        autoComplete="off"
                        placeholder={t('requestForm.step2.countryPlaceholder')}
                        className="w-full p-3.5 pr-10 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm"
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        onBlur={() => {
                          const idx = COUNTRIES_LOWER.indexOf(formData.country.trim().toLowerCase());
                          if (idx !== -1) updateField('country', VALID_COUNTRIES[idx]);
                        }}
                      />
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>
                    <datalist id="country-list">
                      {VALID_COUNTRIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <FieldError field="country" />
                  </div>

                  {/* Deliverables */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      {t('requestForm.step2.deliverablesLabel')}
                    </label>
                    <p className="text-xs text-zinc-600 mb-4">
                      {t('requestForm.step2.deliverablesHint')}
                    </p>

                    <div className="space-y-3">
                      {/* Sharing & Embedding */}
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pt-1">
                        {t('requestForm.step2.sharingEmbedding')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: 'hosted_viewer_link',
                            label: t('requestForm.step2.hostedViewerLink'),
                            desc: t('requestForm.step2.hostedViewerDesc'),
                            icon: Globe,
                            badge: t('requestForm.step2.popular'),
                            info: 'We host your 3D model on our platform and give you a shareable link. Anyone with the link can view and interact with the 3D model in their browser — no app download or technical setup needed. Ideal for sharing with clients, on social media, or in emails.',
                          },
                          {
                            id: 'website_embed',
                            label: t('requestForm.step2.websiteEmbed'),
                            desc: t('requestForm.step2.websiteEmbedDesc'),
                            icon: Code2,
                            info: 'Get a ready-to-use HTML embed code (iframe) that you can paste directly into your website, landing page, or online store. The 3D viewer loads inline on your page so visitors can interact with the model without leaving your site.',
                          },
                        ].map(({ id, label, desc, icon: Icon, badge, info }) => {
                          const selected = formData.deliverables.includes(id);
                          return (
                            <label
                              key={id}
                              className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                selected
                                  ? 'border-brand-500/50 bg-brand-500/5'
                                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selected}
                                onChange={() => toggleArrayField('deliverables', id)}
                              />
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                  selected
                                    ? 'bg-brand-600/20 text-brand-400'
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white text-sm">{label}</span>
                                  {badge && (
                                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                      {badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenInfoId(openInfoId === id ? null : id); }}
                                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                                aria-label={`More info about ${label}`}
                              >
                                {openInfoId === id ? <XIcon className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                              </button>
                              {selected && openInfoId !== id && (
                                <Check className="absolute top-3 right-10 w-4 h-4 text-brand-400" />
                              )}
                              {openInfoId === id && (
                                <div className="absolute inset-x-0 top-full mt-1 z-20 mx-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl text-xs text-zinc-300 leading-relaxed">
                                  {info}
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {/* AR */}
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pt-3">
                        {t('requestForm.step2.arExperiences')}
                      </p>
                      {(() => {
                        const arId = 'ar_experience';
                        const arSelected = formData.deliverables.includes(arId);
                        const arInfo = 'We deliver your 3D model optimized for augmented reality on all platforms. iPhone, iPad, and Android users can tap a link and instantly place your product in their real environment through the camera — no app required. Works with Safari, Chrome, and all major browsers.';
                        return (
                          <label
                            className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              arSelected
                                ? 'border-brand-500/50 bg-brand-500/5'
                                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={arSelected}
                              onChange={() => toggleArrayField('deliverables', arId)}
                            />
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                arSelected
                                  ? 'bg-brand-600/20 text-brand-400'
                                  : 'bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">AR Experience</span>
                                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  iOS + Android
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-0.5">Cross-platform AR — works on all devices, no app needed</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenInfoId(openInfoId === arId ? null : arId); }}
                              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                              aria-label="More info about AR Experience"
                            >
                              {openInfoId === arId ? <XIcon className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                            </button>
                            {arSelected && openInfoId !== arId && (
                              <Check className="absolute top-3 right-10 w-4 h-4 text-brand-400" />
                            )}
                            {openInfoId === arId && (
                              <div className="absolute inset-x-0 top-full mt-1 z-20 mx-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl text-xs text-zinc-300 leading-relaxed">
                                {arInfo}
                              </div>
                            )}
                          </label>
                        );
                      })()}

                      {/* Files */}
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pt-3">
                        {t('requestForm.step2.filesPrint')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: 'downloads_bundle',
                            label: t('requestForm.step2.rawFiles'),
                            desc: t('requestForm.step2.rawFilesDesc'),
                            icon: Package,
                            info: 'Download the original 3D model files in industry-standard formats (GLB, USDZ, OBJ). Use them in your own apps, product configurators, game engines, or any 3D software. Full ownership — no platform lock-in.',
                          },
                          {
                            id: 'qr_codes',
                            label: t('requestForm.step2.qrCodes'),
                            desc: t('requestForm.step2.qrCodesDesc'),
                            icon: QrCode,
                            info: 'Get custom-branded QR codes for each 3D model. Print them on menus, product packaging, shelf tags, or marketing materials. Customers scan with their phone camera to instantly view the product in 3D or AR.',
                          },
                        ].map(({ id, label, desc, icon: Icon, info }) => {
                          const selected = formData.deliverables.includes(id);
                          return (
                            <label
                              key={id}
                              className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                selected
                                  ? 'border-brand-500/50 bg-brand-500/5'
                                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selected}
                                onChange={() => toggleArrayField('deliverables', id)}
                              />
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                  selected
                                    ? 'bg-brand-600/20 text-brand-400'
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <span className="font-semibold text-white text-sm block">
                                  {label}
                                </span>
                                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenInfoId(openInfoId === id ? null : id); }}
                                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                                aria-label={`More info about ${label}`}
                              >
                                {openInfoId === id ? <XIcon className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                              </button>
                              {selected && openInfoId !== id && (
                                <Check className="absolute top-3 right-10 w-4 h-4 text-brand-400" />
                              )}
                              {openInfoId === id && (
                                <div className="absolute inset-x-0 top-full mt-1 z-20 mx-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl text-xs text-zinc-300 leading-relaxed">
                                  {info}
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <FieldError field="deliverables" />
                  </div>
                </div>
              )}

              {/* ═══ Step 3: Contact ═══ */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-2">
                      {t('requestForm.step3.heading')}
                    </h2>
                    <p className="text-sm text-zinc-500">{t('requestForm.step3.desc')}</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        {t('requestForm.step3.fullName')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('requestForm.step3.fullNamePlaceholder')}
                        className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm"
                        value={formData.contact.full_name}
                        onChange={(e) => updateContact('full_name', e.target.value)}
                      />
                      <FieldError field="full_name" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        {t('requestForm.step3.email')}
                      </label>
                      <input
                        type="email"
                        placeholder={t('requestForm.step3.emailPlaceholder')}
                        className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm"
                        value={formData.contact.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                      />
                      <FieldError field="email" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        {t('requestForm.step3.company')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('requestForm.step3.companyPlaceholder')}
                        className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm"
                        value={formData.contact.company}
                        onChange={(e) => updateContact('company', e.target.value)}
                      />
                      <FieldError field="company" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        {t('requestForm.step3.phone')}{' '}
                        <span className="text-zinc-600 normal-case font-normal tracking-normal">
                          ({t('requestForm.step3.optional')})
                        </span>
                      </label>
                      <input
                        type="tel"
                        placeholder={t('requestForm.step3.phonePlaceholder')}
                        className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all text-sm"
                        value={formData.contact.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Trust badge near contact fields */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-zinc-400">
                      {t('requestForm.step3.trustBadge')}
                    </span>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 text-sm">
                    <input type="checkbox" required className="mt-1 accent-brand-600" />
                    <span className="text-zinc-500 text-xs leading-relaxed">
                      {t('requestForm.step3.terms')}{' '}
                      <Link
                        to="/terms"
                        className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors"
                      >
                        {t('requestForm.step3.termsOfService')}
                      </Link>{' '}
                      {t('requestForm.step3.and')}{' '}
                      <Link
                        to="/privacy"
                        className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors"
                      >
                        {t('requestForm.step3.privacyPolicy')}
                      </Link>
                      {t('requestForm.step3.termsNote')}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-6">
                  <p className="flex items-center text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex justify-between items-center mt-10 pt-8 border-t border-zinc-800/60">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStep((s) => s - 1);
                      setErrors({});
                    }}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 font-medium text-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> {t('requestForm.nav.back')}
                  </button>
                ) : (
                  <div />
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all hover:-translate-y-px hover:shadow-glow"
                  >
                    {t('requestForm.nav.continue')}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all hover:-translate-y-px hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('requestForm.nav.sending')}
                      </>
                    ) : (
                      <>
                        {t('requestForm.nav.submit')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Right: Estimate Sidebar ── */}
          <div className="lg:sticky lg:top-8 space-y-4">
            {/* Estimate card */}
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-5 bg-gradient-to-br from-brand-600/20 to-brand-700/10 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-brand-400/70" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400/70">
                    {t('requestForm.estimate.liveEstimate')}
                  </span>
                </div>
                {hasEstimate && !isCustomQty ? (
                  <>
                    <p className="font-display text-2xl font-bold text-white">
                      {captureDiscountPct > 0 && (
                        <span className="text-base font-medium text-zinc-500 line-through mr-2">
                          {fmtEur(totalLoFull)}
                        </span>
                      )}
                      {fmtEur(totalLo)}
                      {totalHi > totalLo && (
                        <span className="text-lg font-medium text-zinc-500">
                          {' '}
                          \u2013 {fmtEur(totalHi)}
                        </span>
                      )}
                    </p>
                    {captureDiscountPct > 0 && (
                      <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                        {captureDiscountPct}% volume discount applied
                      </p>
                    )}
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {t('requestForm.estimate.oneTimeCapture')}
                    </p>
                  </>
                ) : hasEstimate && isCustomQty ? (
                  <>
                    <p className="font-display text-xl font-bold text-white">
                      {t('requestForm.estimate.customPricing')}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {t('requestForm.estimate.tailoredVolume')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-semibold text-zinc-600">
                      {t('requestForm.estimate.completeForm')}
                    </p>
                    <p className="text-xs text-zinc-700 mt-0.5">
                      {t('requestForm.estimate.toPreviewCost')}
                    </p>
                  </>
                )}
              </div>

              {/* Line items */}
              <div className="px-5 pt-4 pb-2 space-y-1">
                {/* Capture */}
                <div className="flex items-start justify-between gap-2 py-3 border-b border-zinc-800/50">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Camera className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {t('requestForm.estimate.capture3d')}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {hasEstimate
                          ? isCustomQty
                            ? t('requestForm.estimate.volumeQuote')
                            : `${fmtEur(captureRate)}/item${captureDiscountPct > 0 ? ` \u00B7 ${captureDiscountPct}% batch discount` : ''}`
                          : formData.industry
                            ? isRestaurant
                              ? 'Starting \u20AC20/item'
                              : isComplex
                                ? 'Complex items \u00B7 \u20AC490/item'
                                : 'Standard items \u00B7 \u20AC290/item'
                            : t('requestForm.estimate.selectScope')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0 pt-0.5">
                    {hasEstimate && !isCustomQty ? (
                      <>
                        {captureDiscountPct > 0 && (
                          <span className="text-xs font-medium text-zinc-500 line-through mr-1.5">
                            {fmtEur(captureLoFull)}
                          </span>
                        )}
                        <span className={captureDiscountPct > 0 ? 'text-emerald-400' : 'text-white'}>
                          {fmtEur(captureLo)}
                          {captureHi > captureLo ? ` \u2013 ${fmtEur(captureHi)}` : ''}
                        </span>
                      </>
                    ) : hasEstimate
                      ? 'Custom'
                      : '\u2014'}
                  </span>
                </div>

                {/* On-site */}
                <div
                  className={`flex items-start justify-between gap-2 py-3 border-b border-zinc-800/50 transition-opacity ${
                    isOnSite && hasEstimate ? 'opacity-100' : 'opacity-25'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {t('requestForm.estimate.onSiteVisit')}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {isRestaurant ? '\u20AC100 / visit' : '\u20AC900 / day + travel'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white flex-shrink-0 pt-0.5">
                    {isOnSite && hasEstimate && !isCustomQty
                      ? onSiteLo === onSiteHi
                        ? fmtEur(onSiteLo)
                        : `${fmtEur(onSiteLo)} \u2013 ${fmtEur(onSiteHi)}`
                      : isOnSite && hasEstimate
                        ? 'Custom'
                        : '\u2014'}
                  </span>
                </div>

                {/* Platform */}
                <div
                  className={`flex items-start justify-between gap-2 py-3 transition-opacity ${
                    plan ? 'opacity-100' : 'opacity-25'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {plan ? `${plan.name} Plan` : t('requestForm.estimate.platformPlan')}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {plan
                          ? `${plan.views} views \u00B7 ${plan.storage} storage`
                          : isGeneral
                            ? t('requestForm.estimate.contactPricing')
                            : t('requestForm.estimate.selectScopeRecommend')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex-shrink-0 pt-0.5">
                    {plan ? `\u20AC${plan.monthly}/mo` : isGeneral ? 'Custom' : '\u2014'}
                  </span>
                </div>
              </div>

              {/* Total */}
              {hasEstimate && (
                <div className="mx-5 mb-5 mt-1 rounded-xl bg-zinc-800/40 border border-zinc-700/30 px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {t('requestForm.estimate.totalOneTime')}
                    </span>
                    <span className="font-display text-lg font-bold text-white">
                      {isCustomQty
                        ? t('requestForm.estimate.getAQuote')
                        : (
                          <>
                            {captureDiscountPct > 0 && (
                              <span className="text-sm font-medium text-zinc-500 line-through mr-2">
                                {fmtEur(totalLoFull)}
                              </span>
                            )}
                            from {fmtEur(totalLo)}
                          </>
                        )}
                    </span>
                  </div>
                  {plan && (
                    <p className="text-[11px] text-zinc-600 mt-1">
                      + \u20AC{plan.monthly}/mo platform subscription
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Trust signals */}
            <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 px-4 py-3.5 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-zinc-500">{t('requestForm.trust.noCreditCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span className="text-xs text-zinc-500">{t('requestForm.trust.freeQuote24h')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span className="text-xs text-zinc-500">{t('requestForm.trust.soc2Gdpr')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating AI Chat Widget (bottom-right) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat panel */}
        {chatOpen && (
          <div className="w-[380px] max-h-[520px] flex flex-col bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Capture Assistant</h3>
                  <p className="text-[11px] text-zinc-500">Helping you find the right solution</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent', maxHeight: '320px' }}>
              {!showContactSales ? (
                <>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-6 h-6 rounded-md bg-purple-600/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                          <Bot className="w-3 h-3 text-purple-400" />
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'ai'
                            ? 'bg-zinc-800/80 border border-zinc-700/40 text-zinc-200 rounded-tl-md'
                            : 'bg-brand-600/20 border border-brand-500/30 text-brand-200 rounded-tr-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-md bg-brand-600/15 border border-brand-500/25 flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                          <User className="w-3 h-3 text-brand-400" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-6 h-6 rounded-md bg-purple-600/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Bot className="w-3 h-3 text-purple-400" />
                      </div>
                      <div className="bg-zinc-800/80 border border-zinc-700/40 rounded-2xl rounded-tl-md px-3.5 py-2.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </>
              ) : !salesSubmitted ? (
                /* Contact Sales form inside chat */
                <div className="space-y-3">
                  <p className="text-[13px] text-zinc-300 font-medium">Leave your details and we&apos;ll call you back:</p>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-800/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 text-[13px]"
                    value={salesForm.name}
                    onChange={(e) => setSalesForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-800/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 text-[13px]"
                    value={salesForm.email}
                    onChange={(e) => setSalesForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-800/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 text-[13px]"
                    value={salesForm.phone}
                    onChange={(e) => setSalesForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <select
                    className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-800/60 text-white focus:outline-none focus:border-brand-500/50 text-[13px] appearance-none"
                    value={salesForm.time}
                    onChange={(e) => setSalesForm((f) => ({ ...f, time: e.target.value }))}
                  >
                    <option value="" className="bg-zinc-900">Best time to call...</option>
                    <option value="morning" className="bg-zinc-900">Morning (9am - 12pm)</option>
                    <option value="afternoon" className="bg-zinc-900">Afternoon (12pm - 5pm)</option>
                    <option value="evening" className="bg-zinc-900">Evening (5pm - 8pm)</option>
                  </select>
                  <textarea
                    placeholder="Brief message..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-800/60 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 text-[13px] resize-none"
                    value={salesForm.message}
                    onChange={(e) => setSalesForm((f) => ({ ...f, message: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowContactSales(false)}
                      className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-[13px] font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSalesSubmit}
                      disabled={!salesForm.name.trim() || !salesForm.email.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request Callback
                    </button>
                  </div>
                </div>
              ) : (
                /* Sales success */
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Request Sent!</p>
                    <p className="text-[12px] text-zinc-400 mt-1">We&apos;ll reach out to <span className="text-white">{salesForm.email}</span> within 24h.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom actions */}
            {!showContactSales && !isTyping && chatStep < AI_SCRIPT.length && (
              <div className="px-4 pb-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-1">Choose an option</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {AI_SCRIPT[chatStep].options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChatAnswer(AI_SCRIPT[chatStep].id, opt)}
                      className="text-left px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-purple-500/40 hover:bg-purple-500/5 text-[13px] text-zinc-300 hover:text-white font-medium transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary CTAs */}
            {!showContactSales && !isTyping && chatStep >= AI_SCRIPT.length && (
              <div className="px-4 pb-4 space-y-2">
                <button
                  type="button"
                  onClick={handleContinueToForm}
                  className="w-full group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[13px] transition-all"
                >
                  Pre-fill Quote Form
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactSales(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-[13px] font-medium transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Talk to Sales
                </button>
              </div>
            )}
          </div>
        )}

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setChatOpen((o) => !o)}
          className={`group w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
            chatOpen
              ? 'bg-zinc-800 border border-zinc-700 shadow-black/30'
              : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30 hover:shadow-purple-500/40'
          }`}
        >
          {chatOpen ? (
            <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <MessageSquare className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default RequestForm;
