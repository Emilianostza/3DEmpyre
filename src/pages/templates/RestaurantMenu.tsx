import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useScrollOffset } from '@/hooks/useScrollOffset';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';
import { ProjectsProvider, MenusProvider } from '@/services/dataProvider';
import type { MenuItemDTO } from '@/types/dtos';
import {
  ChefHat,
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  RotateCcw,
  Maximize2,
  Minimize2,
  Settings,
  Search,
  Phone,
  MapPin,
  Share2,
  QrCode,
  Copy,
  Download,
  Box,
  Clock,
  Trash2,
  CopyPlus,
  EyeOff,
  Eye,
  GripVertical,
  Code2,
  Check,
  ExternalLink as _ExternalLink,
  MoreVertical,
  Edit3,
  SlidersHorizontal as _SlidersHorizontal,
  Paintbrush,
  LayoutGrid as _LayoutGrid,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Upload as _Upload,
  Wand2,
  Loader2,
  Pencil,
  Plus,
  Library,
} from 'lucide-react';
import { Project } from '@/types';
const MenuSettingsModal = React.lazy(() =>
  import('@/components/portal/MenuSettingsModal').then((m) => ({ default: m.MenuSettingsModal }))
);
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { placeholder } from '@/config/site';
import StaggerContainer from '@/components/motion/StaggerContainer';
import StaggerItem from '@/components/motion/StaggerItem';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import { BaseModal } from '@/components/common/BaseModal';
import { SkeletonCard } from '@/components/Skeleton';
import { DishCardContent, tagStyle as sharedTagStyle } from '@/components/common/DishCardContent';
import { DishCardShell } from '@/components/common/DishCardShell';
import {
  CustomizationPanel,
  THEME_PRESETS,
  DEFAULT_CUSTOMIZATION,
  hexToRgb,
  rgbToHsl,
  extractDominantColor as _extractDominantColor,
  suggestLayoutFromColor as _suggestLayoutFromColor,
  useLayoutPresets,
  type CustomizationState,
  type CardLayout,
  type CardStyle,
  type MenuSpacing,
  type HeroSize,
  type FontWeight,
  type CardRadius,
  type SavedLayoutPreset,
} from '@/components/common/CustomizationPanel';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  price: string;
  image: string;
  calories: string;
  tags: string[];
  allergens: string[];
  modelUrl: string;
  pairsWell: string[];
  spiceLevel?: number;
  hidden?: boolean;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  viewCount?: number;
  arLaunches?: number;
  marketplace_listed?: boolean;
  marketplace_price?: string;
  fieldVisibility?: Partial<FieldVisibility>;
}

interface Category {
  id: string;
  label: string;
  desc: string;
}

interface FieldVisibility {
  description: boolean;
  price: boolean;
  calories: boolean;
  image: boolean;
  tags: boolean;
  allergens: boolean;
  pairsWell: boolean;
  spiceLevel: boolean;
}

const DEFAULT_FIELD_VISIBILITY: FieldVisibility = {
  description: true,
  price: true,
  calories: true,
  image: true,
  tags: true,
  allergens: true,
  pairsWell: true,
  spiceLevel: true,
};

interface MenuSettings {
  title: string;
  brandColor: string;
  font: string;
  showPrices: boolean;
  currency: string;
  fieldVisibility: FieldVisibility;
  hours: string;
  enableTimeBasedMenu?: boolean;
  breakfastEndTime?: string;
  lunchEndTime?: string;
  lunchMenuId?: string;
  dinnerMenuId?: string;
  themePreset?: string;
  customBrandColor?: string;
}

/** Draft version of MenuItem where array fields are comma-separated strings for editing */
interface DraftMenuItem extends Omit<MenuItem, 'tags' | 'allergens' | 'pairsWell'> {
  tags: string;
  allergens: string;
  pairsWell: string;
}

type ModalPanel = 'review' | 'qr' | 'edit' | '3d-settings';

// ─── Common Allergens ─────────────────────────────────────────────────────────

const COMMON_ALLERGENS = [
  'Milk', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Crustaceans',
  'Tree Nuts', 'Peanuts', 'Wheat', 'Gluten', 'Soy', 'Sesame',
  'Celery', 'Mustard', 'Lupin', 'Molluscs', 'Sulphites', 'Corn',
] as const;

const COMMON_TAGS = [
  "Chef's Pick", 'Bestseller', 'Signature', 'New', 'Seasonal',
  'Spicy', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Organic',
  'Raw', 'Shareable', 'Premium', 'Classic', 'House Special',
  'Low Carb', 'Keto', 'Sugar-Free', 'Dairy-Free', 'Halal',
] as const;

// ─── Per-Customer Menu Persistence ───────────────────────────────────────────

const MENU_STORAGE_KEY = (orgId: string, projectId: string) =>
  `mc3d_menu_${orgId}_${projectId}`;

interface PersistedMenuState {
  menuItems: MenuItem[];
  menuSettings: MenuSettings;
  customization: CustomizationState;
}

function loadMenuFromStorage(orgId: string, projectId: string): PersistedMenuState | null {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY(orgId, projectId));
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted or unavailable */ }
  return null;
}

function saveMenuToStorage(orgId: string, projectId: string, state: PersistedMenuState): void {
  try {
    localStorage.setItem(MENU_STORAGE_KEY(orgId, projectId), JSON.stringify(state));
  } catch { /* full or unavailable */ }
}

/** Shared input class for all form fields in the edit panel */
const INPUT_CLASS =
  'w-full px-3 py-2 bg-stone-800/50 border border-stone-700/40 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all';

// ─── Z-Index Scale ───────────────────────────────────────────────────────────

const Z = {
  sheetBackdrop: 60,
  sheetPanel: 70,
  dropdown: 100,
  viewerOverlay: 100,
  cardElevated: 110,
  cardModal: 120,
  detailsBackdrop: 130,
  detailsSheet: 140,
} as const;

// ─── Shared Helpers ──────────────────────────────────────────────────────────

/** Returns modal tab definitions with translated labels. */
function getModalTabs(t: TFunction) {
  return [
    { id: 'edit' as const, icon: Edit3, label: t('tpl.menu.editDetails', 'Edit Details') },
    { id: 'qr' as const, icon: QrCode, label: t('tpl.menu.qrCode', 'QR Code') },
  ];
}

/** Returns review status config with translated label and styling. */
function getReviewConfig(t: TFunction, status: 'pending' | 'approved' | 'rejected') {
  const configs = {
    pending: {
      label: t('tpl.menu.reviewPending', 'Pending Review'),
      color: 'text-amber-400',
      bg: 'bg-amber-900/20 border-amber-800/40',
      dot: 'bg-amber-400',
    },
    approved: {
      label: t('tpl.menu.reviewApproved', 'Approved'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/20 border-emerald-800/40',
      dot: 'bg-emerald-400',
    },
    rejected: {
      label: t('tpl.menu.reviewRejected', 'Needs Changes'),
      color: 'text-red-400',
      bg: 'bg-red-900/20 border-red-800/40',
      dot: 'bg-red-400',
    },
  };
  return configs[status];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food', desc: 'From small plates to signature dishes' },
  { id: 'drinks', label: 'Drinks', desc: 'Handcrafted beverages' },
];

const DISH_LIBRARY: MenuItem[] = [
  { id: 'lib-1', name: 'Caesar Salad', category: 'salads', desc: 'Crisp romaine, parmesan, croutons, house-made Caesar dressing.', price: '$14', image: '', calories: '320', tags: ['Classic', 'Bestseller'], allergens: ['Dairy', 'Gluten', 'Eggs'], modelUrl: '', pairsWell: [] },
  { id: 'lib-2', name: 'French Onion Soup', category: 'soups', desc: 'Caramelized onions, rich beef broth, gruyère crouton.', price: '$12', image: '', calories: '280', tags: ['Classic', 'House Special'], allergens: ['Dairy', 'Gluten'], modelUrl: '', pairsWell: [] },
  { id: 'lib-3', name: 'Truffle Fries', category: 'sides', desc: 'Hand-cut fries, truffle oil, parmesan, fresh herbs.', price: '$11', image: '', calories: '420', tags: ['Bestseller', 'Shareable'], allergens: ['Dairy'], modelUrl: '', pairsWell: [] },
  { id: 'lib-4', name: 'Margherita Pizza', category: 'mains', desc: 'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.', price: '$18', image: '', calories: '680', tags: ['Classic', 'Vegetarian'], allergens: ['Dairy', 'Gluten'], modelUrl: '', pairsWell: [] },
  { id: 'lib-5', name: 'Grilled Salmon', category: 'mains', desc: 'Atlantic salmon, lemon butter sauce, seasonal vegetables.', price: '$26', image: '', calories: '450', tags: ['Signature', 'Organic'], allergens: ['Fish'], modelUrl: '', pairsWell: [] },
  { id: 'lib-6', name: 'Tiramisu', category: 'desserts', desc: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa.', price: '$13', image: '', calories: '380', tags: ['Classic', "Chef's Pick"], allergens: ['Dairy', 'Gluten', 'Eggs'], modelUrl: '', pairsWell: [] },
  { id: 'lib-7', name: 'Bruschetta', category: 'starters', desc: 'Toasted ciabatta, heirloom tomatoes, garlic, fresh basil.', price: '$10', image: '', calories: '220', tags: ['Vegetarian', 'Shareable'], allergens: ['Gluten'], modelUrl: '', pairsWell: [] },
  { id: 'lib-8', name: 'Mojito', category: 'beverages', desc: 'White rum, fresh mint, lime, sugar, soda water.', price: '$14', image: '', calories: '180', tags: ['Classic', 'Signature'], allergens: [], modelUrl: '', pairsWell: [] },
  { id: 'lib-9', name: 'Chicken Wings', category: 'starters', desc: 'Crispy wings, choice of buffalo, BBQ, or garlic parmesan sauce.', price: '$15', image: '', calories: '520', tags: ['Bestseller', 'Spicy', 'Shareable'], allergens: ['Dairy'], modelUrl: '', pairsWell: [] },
  { id: 'lib-10', name: 'Mushroom Risotto', category: 'mains', desc: 'Arborio rice, wild mushrooms, parmesan, white truffle oil.', price: '$22', image: '', calories: '560', tags: ['Vegetarian', 'Signature'], allergens: ['Dairy'], modelUrl: '', pairsWell: [] },
  { id: 'lib-11', name: 'Lemonade', category: 'beverages', desc: 'Fresh-squeezed lemons, house simple syrup, sparkling or still.', price: '$6', image: '', calories: '120', tags: ['Classic'], allergens: [], modelUrl: '', pairsWell: [] },
  { id: 'lib-12', name: 'Garlic Bread', category: 'sides', desc: 'Sourdough, roasted garlic butter, melted mozzarella.', price: '$8', image: '', calories: '310', tags: ['Classic', 'Shareable'], allergens: ['Dairy', 'Gluten'], modelUrl: '', pairsWell: [] },
  { id: 'lib-13', name: 'Lobster Bisque', category: 'soups', desc: 'Creamy lobster broth, sherry, chive cream.', price: '$16', image: '', calories: '320', tags: ['Premium', "Chef's Pick"], allergens: ['Shellfish', 'Dairy'], modelUrl: '', pairsWell: [] },
  { id: 'lib-14', name: 'Steak Frites', category: 'specials', desc: '8oz ribeye, hand-cut fries, béarnaise sauce, watercress.', price: '$34', image: '', calories: '780', tags: ['Signature', 'Premium'], allergens: ['Dairy'], modelUrl: '', pairsWell: [] },
  { id: 'lib-15', name: 'Chocolate Lava Cake', category: 'desserts', desc: 'Warm molten center, vanilla bean ice cream, berry coulis.', price: '$14', image: '', calories: '480', tags: ["Chef's Pick", 'Bestseller'], allergens: ['Dairy', 'Gluten', 'Eggs'], modelUrl: '', pairsWell: [] },
];

const RESTAURANT_INFO = {
  cuisine: 'Contemporary European',
  neighborhood: 'Old Town',
  phone: '+1 555 0100',
  address: '12 Harbor Lane',
  hours: 'Mon–Sun 12:00–23:00',
  isOpen: true,
};

const INITIAL_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Wagyu Tartare',
    category: 'food',
    desc: 'A5 wagyu, quail egg yolk, capers, shallots, dijon, served with crostini.',
    price: '$28',
    image: '/images/2N2A1724.webp',
    calories: '380 kcal',
    tags: ['Raw', "Chef's Pick"],
    allergens: ['Egg', 'Gluten'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['2', '3'],
    reviewStatus: 'approved',
    viewCount: 1842,
    arLaunches: 312,
  },
  {
    id: '2',
    name: 'Truffle Fries',
    category: 'food',
    desc: 'Hand-cut Kennebec potatoes, parmesan dust, fresh herbs, drizzled with black truffle oil.',
    price: '$12',
    image: placeholder(400, 300, 'Truffle Fries', 45),
    calories: '450 kcal',
    tags: ['Vegetarian', 'Shareable'],
    allergens: ['Dairy'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['5'],
    reviewStatus: 'approved',
    viewCount: 965,
    arLaunches: 87,
  },
  {
    id: '3',
    name: 'Signature Burger',
    category: 'food',
    desc: 'Wagyu beef patty, aged white cheddar, house-made truffle aioli, caramelized onions on a toasted brioche bun.',
    price: '$24',
    image: placeholder(400, 300, 'Signature Burger', 25),
    calories: '850 kcal',
    tags: ["Chef's Pick", 'Bestseller'],
    allergens: ['Gluten', 'Dairy', 'Egg'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['2', '4'],
    reviewStatus: 'pending',
    viewCount: 2340,
    arLaunches: 518,
  },
  {
    id: '4',
    name: 'Lobster Roll',
    category: 'food',
    desc: 'Maine lobster, lemon-herb butter, chives, served on a toasted New England split-top roll.',
    price: '$32',
    image: placeholder(400, 300, 'Lobster Roll', 10),
    calories: '520 kcal',
    tags: ['Premium', 'Seasonal'],
    allergens: ['Shellfish', 'Gluten', 'Dairy'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['2'],
    reviewStatus: 'approved',
    viewCount: 1120,
    arLaunches: 203,
  },
  {
    id: '5',
    name: 'Artisan Shake',
    category: 'food',
    desc: 'Tahitian vanilla bean, house salted caramel swirl, whipped cream, edible gold leaf.',
    price: '$16',
    image: placeholder(400, 300, 'Artisan Shake', 280),
    calories: '600 kcal',
    tags: ['Signature', 'Sweet'],
    allergens: ['Dairy', 'Egg'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['6'],
    reviewStatus: 'rejected',
    viewCount: 430,
    arLaunches: 28,
  },
  {
    id: '6',
    name: 'Crème Brûlée',
    category: 'food',
    desc: 'Classic Tahitian vanilla custard, torched sugar crust, fresh berries.',
    price: '$14',
    image: placeholder(400, 300, 'Crème Brûlée', 40),
    calories: '420 kcal',
    tags: ['Dessert', 'Classic'],
    allergens: ['Dairy', 'Egg'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['5'],
    reviewStatus: 'approved',
    viewCount: 780,
    arLaunches: 145,
  },
  {
    id: '7',
    name: 'Burrata Caprese',
    category: 'food',
    desc: 'Creamy burrata, heirloom tomatoes, aged balsamic reduction, fresh basil, extra virgin olive oil.',
    price: '$18',
    image: placeholder(400, 300, 'Burrata Caprese', 60),
    calories: '320 kcal',
    tags: ['Vegetarian', 'Fresh'],
    allergens: ['Dairy'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['3', '4'],
    reviewStatus: 'approved',
    viewCount: 1230,
    arLaunches: 198,
  },
  {
    id: '8',
    name: 'Grilled Salmon',
    category: 'food',
    desc: 'Atlantic salmon, lemon-dill beurre blanc, roasted asparagus, fingerling potatoes.',
    price: '$34',
    image: placeholder(400, 300, 'Grilled Salmon', 20),
    calories: '620 kcal',
    tags: ['Healthy', "Chef's Pick"],
    allergens: ['Fish', 'Dairy'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['7', '12'],
    reviewStatus: 'approved',
    viewCount: 1580,
    arLaunches: 267,
  },
  {
    id: '9',
    name: 'Mushroom Risotto',
    category: 'food',
    desc: 'Arborio rice, wild porcini mushrooms, white truffle oil, aged parmesan, fresh chives.',
    price: '$22',
    image: placeholder(400, 300, 'Mushroom Risotto', 35),
    calories: '580 kcal',
    tags: ['Vegetarian', 'Comfort'],
    allergens: ['Dairy'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['7', '2'],
    reviewStatus: 'approved',
    viewCount: 920,
    arLaunches: 134,
  },
  {
    id: '10',
    name: 'Tiramisu',
    category: 'food',
    desc: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa dust, dark chocolate shavings.',
    price: '$15',
    image: placeholder(400, 300, 'Tiramisu', 55),
    calories: '480 kcal',
    tags: ['Classic', 'Popular'],
    allergens: ['Dairy', 'Egg', 'Gluten'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['11'],
    reviewStatus: 'approved',
    viewCount: 1050,
    arLaunches: 176,
  },
  {
    id: '11',
    name: 'Espresso Martini',
    category: 'drinks',
    desc: 'Fresh espresso, premium vodka, coffee liqueur, vanilla syrup, served ice cold.',
    price: '$16',
    image: placeholder(400, 300, 'Espresso Martini', 70),
    calories: '210 kcal',
    tags: ['Signature', 'Cocktail'],
    allergens: [],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['10', '6'],
    reviewStatus: 'approved',
    viewCount: 1420,
    arLaunches: 89,
  },
  {
    id: '12',
    name: 'Sparkling Lemonade',
    category: 'drinks',
    desc: 'House-made lemonade, elderflower syrup, sparkling water, fresh mint, served over ice.',
    price: '$8',
    image: placeholder(400, 300, 'Sparkling Lemonade', 85),
    calories: '120 kcal',
    tags: ['Non-Alcoholic', 'Refreshing'],
    allergens: [],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['8', '4'],
    reviewStatus: 'approved',
    viewCount: 680,
    arLaunches: 42,
  },
  {
    id: '13',
    name: 'Tuna Poke Bowl',
    category: 'food',
    desc: 'Sushi-grade ahi tuna, avocado, edamame, sesame-soy dressing, crispy wonton chips.',
    price: '$22',
    image: placeholder(400, 300, 'Tuna Poke Bowl', 50),
    calories: '410 kcal',
    tags: ['Healthy', 'Popular'],
    allergens: ['Fish', 'Soy', 'Gluten'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['12'],
    reviewStatus: 'approved',
    viewCount: 1150,
    arLaunches: 210,
  },
  {
    id: '14',
    name: 'Filet Mignon',
    category: 'food',
    desc: '8oz center-cut filet, red wine jus, truffle mashed potatoes, grilled broccolini.',
    price: '$48',
    image: placeholder(400, 300, 'Filet Mignon', 5),
    calories: '780 kcal',
    tags: ['Premium', "Chef's Pick"],
    allergens: ['Dairy'],
    modelUrl: '/models/AdvancedExport/3DModel_Custom.gltf',
    pairsWell: ['7', '11'],
    reviewStatus: 'approved',
    viewCount: 2100,
    arLaunches: 445,
  },
];

const tagStyle = sharedTagStyle;

// ─── DTO Mappers (camelCase ↔ snake_case) ────────────────────────────────────

/** Convert a DTO (snake_case) menu item to the local MenuItem shape. */
function fromDTO(dto: MenuItemDTO): MenuItem {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    desc: dto.desc,
    price: dto.price,
    image: dto.image,
    calories: dto.calories,
    tags: dto.tags,
    allergens: dto.allergens,
    modelUrl: dto.model_url,
    pairsWell: dto.pairs_well,
    hidden: dto.hidden,
    reviewStatus: dto.review_status,
    viewCount: dto.view_count,
    arLaunches: dto.ar_launches,
    marketplace_listed: dto.marketplace_listed,
    marketplace_price: dto.marketplace_price,
  };
}

/** Convert a local MenuItem to the DTO (snake_case) shape for persistence. */
function toDTO(item: MenuItem): MenuItemDTO {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    desc: item.desc,
    price: item.price,
    image: item.image,
    calories: item.calories,
    tags: item.tags,
    allergens: item.allergens,
    model_url: item.modelUrl,
    pairs_well: item.pairsWell,
    hidden: item.hidden,
    review_status: item.reviewStatus,
    view_count: item.viewCount,
    ar_launches: item.arLaunches,
    marketplace_listed: item.marketplace_listed,
    marketplace_price: item.marketplace_price,
  };
}

// ─── Shared: Controls Hint ───────────────────────────────────────────────────

const ControlsHint: React.FC<{ pointerEventsNone?: boolean }> = ({ pointerEventsNone = true }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`absolute bottom-2 left-1/2 -translate-x-1/2 ${pointerEventsNone ? 'pointer-events-none' : ''}`}
    >
      <div className="bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 text-white animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {t('tpl.menu.dragScrollRotate', 'Drag • Scroll • Rotate')}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Inline3DPreview ─────────────────────────────────────────────────────────

interface Inline3DPreviewProps {
  modelUrl: string;
  itemName: string;
  brandColor: string;
  onExpand: () => void;
  expandAsButton?: boolean;
}

const Inline3DPreview: React.FC<Inline3DPreviewProps> = React.memo(
  ({ modelUrl, itemName, brandColor, onExpand, expandAsButton = false }) => {
    const expandIcon = (
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
      </svg>
    );

    return (
      <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto" style={{ zIndex: 10 }}>
        <model-viewer
          src={modelUrl}
          alt={`Interactive 3D preview of ${itemName}`}
          camera-controls
          disable-zoom
          auto-rotate
          auto-rotate-delay="400"
          rotation-per-second="30deg"
          camera-orbit="45deg 75deg 1.3m"
          shadow-intensity="0.9"
          exposure="1.1"
          interaction-prompt="none"
          loading="eager"
          touch-action="pan-y"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at 50% 50%, #292524 0%, #0c0a09 100%)',
          }}
        />

        <ControlsHint />

        {expandAsButton ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="absolute top-2 right-2 pointer-events-auto opacity-75 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
            aria-label="View in full screen"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all"
              style={{ backgroundColor: `${brandColor}dd` }}
            >
              {expandIcon}
            </div>
          </button>
        ) : (
          <div className="absolute top-2 right-2 pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-xl border border-white/20"
              style={{ backgroundColor: `${brandColor}dd` }}
            >
              {expandIcon}
            </div>
          </div>
        )}
      </div>
    );
  }
);
Inline3DPreview.displayName = 'Inline3DPreview';


// ─── MenuHeader ───────────────────────────────────────────────────────────────

interface MenuHeaderProps {
  title: string;
  brandColor: string;
  isEditMode: boolean;
  isOwner: boolean;
  isSaving: boolean;
  onSettings: () => void;
  onSave: () => void;
  headerRef?: React.RefObject<HTMLElement | null>;
}

const MenuHeader: React.FC<MenuHeaderProps> = React.memo(
  ({ title, brandColor, isEditMode, isOwner, isSaving, onSettings, onSave, headerRef }) => {
    const { t } = useTranslation();
    return (
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-zinc-950/60 backdrop-blur-2xl border-b border-white/5 shadow-sm"
      >
        <div className="px-5 md:px-8 h-16 flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black tracking-widest shadow-lg"
              style={{
                backgroundColor: `${brandColor}15`,
                color: brandColor,
                border: `1px solid ${brandColor}30`,
              }}
            >
              {title.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-bold text-lg text-white truncate tracking-tight font-serif-premium">
              {title}
            </span>
            {isEditMode && (
              <span
                className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10"
                style={{
                  color: brandColor,
                  backgroundColor: `${brandColor}10`,
                }}
              >
                {t('tpl.menu.editing')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label={t('tpl.menu.callRestaurant')}
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(RESTAURANT_INFO.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label={t('tpl.menu.getDirections')}
            >
              <MapPin className="w-4 h-4" />
            </a>
            {isOwner && (
              <>
                {isEditMode && (
                  <>
                    <button
                      onClick={onSettings}
                      className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                      aria-label={t('tpl.menu.menuSettings')}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                      onClick={onSave}
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:brightness-110 active:scale-95"
                      style={{
                        backgroundColor: brandColor,
                        boxShadow: `0 10px 15px -3px ${brandColor}33`,
                      }}
                    >
                      {isSaving ? t('tpl.menu.saving') : t('tpl.menu.save')}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    );
  }
);
MenuHeader.displayName = 'MenuHeader';

// ─── MenuHero ─────────────────────────────────────────────────────────────────

interface MenuHeroProps {
  title: string;
  brandColor: string;
  onViewSignature: () => void;
  onHowAR: () => void;
  heroSize?: HeroSize;
  heroImage?: string;
  onHeroImageChange?: (url: string) => void;
  isEditMode?: boolean;
  onCustomize?: () => void;
  customizeChangedCount?: number;
  presets?: SavedLayoutPreset[];
  activePresetId?: string | null;
  onLoadPreset?: (presetId: string) => void;
  hours?: string;
  onHoursChange?: (hours: string) => void;
}

const HERO_SIZE_CLASSES: Record<HeroSize, string> = {
  short: 'h-[45vw] min-h-[240px] max-h-[360px]',
  default: 'h-[65vw] min-h-[320px] max-h-[560px]',
  tall: 'h-[80vw] min-h-[400px] max-h-[720px]',
};

const MenuHero: React.FC<MenuHeroProps> = React.memo(
  ({ title, brandColor, onViewSignature: _onViewSignature, onHowAR: _onHowAR, heroSize = 'default', heroImage, onHeroImageChange, isEditMode, onCustomize, customizeChangedCount = 0, presets = [], activePresetId = null, onLoadPreset, hours, onHoursChange }) => {
    const { t } = useTranslation();
    const [showPresets, setShowPresets] = useState(false);
    const presetsDropdownRef = useRef<HTMLDivElement>(null);
    const heroFileInputRef = useRef<HTMLInputElement>(null);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const imageMenuRef = useRef<HTMLDivElement>(null);
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [editingHours, setEditingHours] = useState(false);
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    const defaultSchedule = DAYS.map((d) => ({ day: d, open: true, from: '12:00', to: '23:00' }));
    const [schedule, setSchedule] = useState(defaultSchedule);
    const [closedDates, setClosedDates] = useState<string[]>([]);
    const [dateOverrides, setDateOverrides] = useState<Record<string, { from: string; to: string }>>({});
    const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);
    const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });

    const formatSchedule = (sched: typeof defaultSchedule) => {
      const openDays = sched.filter((d) => d.open);
      if (openDays.length === 0) return 'Closed';
      const allSame = openDays.every((d) => d.from === openDays[0].from && d.to === openDays[0].to);
      if (allSame && openDays.length === 7) return `Mon–Sun ${openDays[0].from}–${openDays[0].to}`;
      if (allSame) {
        const names = openDays.map((d) => d.day);
        const indices = names.map((n) => DAYS.indexOf(n));
        const isConsecutive = indices.every((v, i) => i === 0 || v === indices[i - 1] + 1);
        const label = isConsecutive && names.length > 2 ? `${names[0]}–${names[names.length - 1]}` : names.join(', ');
        return `${label} ${openDays[0].from}–${openDays[0].to}`;
      }
      return openDays.map((d) => `${d.day} ${d.from}–${d.to}`).join(' · ');
    };

    const getCalendarDays = (monthStart: Date) => {
      const year = monthStart.getFullYear();
      const month = monthStart.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
      const cells: (number | null)[] = Array(offset).fill(null);
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);
      return cells;
    };

    const toDateStr = (day: number) => {
      const y = calMonth.getFullYear();
      const m = String(calMonth.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}-${String(day).padStart(2, '0')}`;
    };

    const toggleClosedDate = (day: number) => {
      const ds = toDateStr(day);
      setClosedDates((prev) => prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]);
    };

    const isDateClosed = (day: number) => closedDates.includes(toDateStr(day));

    const isDayInPast = (day: number) => {
      const date = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return date < today;
    };

    const calendarCells = getCalendarDays(calMonth);
    const calMonthLabel = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
    const aiTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Clean up AI generation timer on unmount
    useEffect(() => {
      return () => {
        if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      };
    }, []);

    const AI_PROMPT_PRESETS = [
      'Elegant fine dining interior with warm lighting',
      'Cozy bistro with exposed brick walls',
      'Modern restaurant with minimalist design',
      'Outdoor terrace dining at sunset',
      'Rustic farmhouse kitchen with fresh ingredients',
      'Vibrant food market with colorful dishes',
    ];

    // Close dropdown on outside click
    useEffect(() => {
      if (!showPresets) return;
      const handler = (e: MouseEvent) => {
        if (presetsDropdownRef.current && !presetsDropdownRef.current.contains(e.target as Node)) {
          setShowPresets(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [showPresets]);

    useEffect(() => {
      if (!showImageMenu) return;
      const handler = (e: MouseEvent) => {
        if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
          setShowImageMenu(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [showImageMenu]);

    const handleAIGenerate = () => {
      if (!aiPrompt.trim()) return;
      setAiGenerating(true);
      setAiPreviewUrl(null);
      // Mock generation: derive a hue from the prompt string
      const hue = Array.from(aiPrompt).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(() => {
        setAiPreviewUrl(placeholder(1600, 900, aiPrompt.slice(0, 30), hue));
        setAiGenerating(false);
      }, 2500);
    };

    return (
      <section
        className={`relative ${HERO_SIZE_CLASSES[heroSize]} overflow-hidden group transition-all duration-500`}
        aria-label="Hero"
      >
        <img
          src={heroImage || placeholder(1600, 900, '', 10)}
          alt="Restaurant ambiance"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Change hero image button + dropdown */}
        {isEditMode && onHeroImageChange && (
          <>
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  onHeroImageChange(url);
                }
                e.target.value = '';
              }}
            />

            {/* AI Image Generator Modal */}
            <BaseModal isOpen={showAIGenerator} onClose={() => { setShowAIGenerator(false); setAiPrompt(''); setAiPreviewUrl(null); setAiGenerating(false); }} maxWidth="max-w-lg">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {t('tpl.menu.aiGenerator', 'AI Image Generator')}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t('tpl.menu.aiGeneratorDesc', 'Describe the image you want to create')}
                    </p>
                  </div>
                </div>

                {/* Prompt input */}
                <div className="mb-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={t('tpl.menu.aiPromptPlaceholder', 'e.g., Elegant restaurant interior with warm ambient lighting and modern decor...')}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none transition-all"
                    disabled={aiGenerating}
                  />
                </div>

                {/* Preset chips */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                    {t('tpl.menu.aiPresets', 'Quick prompts')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_PROMPT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAiPrompt(preset)}
                        disabled={aiGenerating}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${aiPrompt === preset
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                          } disabled:opacity-50`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview area */}
                {(aiGenerating || aiPreviewUrl) && (
                  <div className="mb-5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    {aiGenerating ? (
                      <div className="h-48 bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                          <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {t('tpl.menu.aiGenerating', 'Generating your image...')}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {t('tpl.menu.aiGeneratingDesc', 'This may take a few seconds')}
                          </p>
                        </div>
                        {/* Progress bar */}
                        <div className="w-48 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-500 animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    ) : aiPreviewUrl ? (
                      <img src={aiPreviewUrl} alt="AI generated preview" className="w-full h-48 object-cover" loading="lazy" width={400} height={192} />
                    ) : null}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {aiPreviewUrl ? (
                    <>
                      <button
                        onClick={() => {
                          onHeroImageChange(aiPreviewUrl);
                          setShowAIGenerator(false);
                          setAiPrompt('');
                          setAiPreviewUrl(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        {t('tpl.menu.aiUseImage', 'Use This Image')}
                      </button>
                      <button
                        onClick={handleAIGenerate}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Wand2 className="w-4 h-4" />
                        {t('tpl.menu.aiRegenerate', 'Regenerate')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAIGenerate}
                      disabled={!aiPrompt.trim() || aiGenerating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 className="w-4 h-4" />
                      {t('tpl.menu.aiGenerate', 'Generate Image')}
                    </button>
                  )}
                </div>

                {/* Demo disclaimer */}
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-4">
                  {t('tpl.menu.aiDemoNote', 'Demo mode — connect an AI API for real image generation')}
                </p>
              </div>
            </BaseModal>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 to-transparent opacity-80" />

        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between gap-6">
            {/* Left — text content */}
            <div
              className="space-y-4 max-w-2xl animate-fade-in-up"
              style={{ animationDuration: '700ms' }}
            >
              <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                {RESTAURANT_INFO.cuisine} &middot; {RESTAURANT_INFO.neighborhood}
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif-premium font-bold text-white mb-4 leading-[1.1] tracking-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span
                  className={`inline-flex items-center gap-2 text-xs md:text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-md border ${RESTAURANT_INFO.isOpen
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${RESTAURANT_INFO.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
                  />
                  {RESTAURANT_INFO.isOpen ? t('tpl.menu.openNow') : t('tpl.menu.closed')}
                </span>
                <div className="relative">
                  <span
                    className={`text-xs md:text-sm font-medium text-white/50 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/[0.06] ${isEditMode ? 'cursor-pointer hover:text-white/80 hover:border-white/15 hover:bg-white/[0.04] transition-all' : ''}`}
                    onClick={isEditMode ? () => setEditingHours(!editingHours) : undefined}
                    title={isEditMode ? 'Click to edit hours' : undefined}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {hours || RESTAURANT_INFO.hours}
                    {isEditMode && <Pencil className="w-3 h-3 opacity-40" />}
                  </span>

                  {isEditMode && editingHours && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setEditingHours(false)}>
                      <div
                        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden"
                        style={{ boxShadow: `0 0 80px ${brandColor}08, 0 25px 50px rgba(0,0,0,0.5)` }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] flex-shrink-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: brandColor + '15' }}>
                              <Clock className="w-5 h-5" style={{ color: brandColor }} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white tracking-tight">Opening Hours</h3>
                              <p className="text-xs text-white/35 mt-0.5">Configure your weekly schedule and special dates</p>
                            </div>
                          </div>
                          <button onClick={() => setEditingHours(false)} className="p-2.5 rounded-xl text-white/25 hover:text-white/70 hover:bg-white/5 transition-all">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Presets strip */}
                        <div className="px-8 py-3.5 border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto flex-shrink-0 bg-white/[0.015]">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mr-1 flex-shrink-0">Presets</span>
                          {[
                            { label: '9–5', fn: () => setSchedule(DAYS.map((d) => ({ day: d, open: true, from: '09:00', to: '17:00' }))) },
                            { label: '12–11 PM', fn: () => setSchedule(DAYS.map((d) => ({ day: d, open: true, from: '12:00', to: '23:00' }))) },
                            { label: '24h', fn: () => setSchedule(DAYS.map((d) => ({ day: d, open: true, from: '00:00', to: '23:59' }))) },
                            { label: 'No Weekends', fn: () => setSchedule((s) => s.map((d) => ['Sat', 'Sun'].includes(d.day) ? { ...d, open: false } : d)) },
                            { label: 'All Open', fn: () => setSchedule((s) => s.map((d) => ({ ...d, open: true }))) },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={preset.fn}
                              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-white/40 bg-white/[0.04] border border-white/[0.06] hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
                            >
                              {preset.label}
                            </button>
                          ))}
                          <div className="w-px h-5 bg-white/[0.06] mx-1 flex-shrink-0" />
                          <button
                            type="button"
                            onClick={() => { setSchedule(defaultSchedule); setClosedDates([]); setDateOverrides({}); setSelectedCalDay(null); }}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-white/30 hover:text-white/60 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                          <div className="flex divide-x divide-white/[0.06]">
                            {/* Left: Weekly Schedule */}
                            <div className="flex-1 p-6 space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3 px-1">Weekly Schedule</p>
                              {schedule.map((entry, idx) => (
                                <div
                                  key={entry.day}
                                  className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${entry.open ? 'bg-white/[0.025] hover:bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setSchedule((s) => s.map((d, i) => i === idx ? { ...d, open: !d.open } : d))}
                                    className={`w-10 h-6 rounded-full transition-all flex-shrink-0 relative ${entry.open ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white/[0.08]'}`}
                                  >
                                    <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${entry.open ? 'left-[19px]' : 'left-[3px]'}`} />
                                  </button>
                                  <span className={`text-sm font-bold w-10 transition-colors ${entry.open ? 'text-white' : 'text-white/25'}`}>{entry.day}</span>
                                  {entry.open ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <input
                                        type="time"
                                        value={entry.from}
                                        onChange={(e) => setSchedule((s) => s.map((d, i) => i === idx ? { ...d, from: e.target.value } : d))}
                                        className="bg-white/[0.06] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-white/20 focus:bg-white/[0.1] transition-all w-[7.5rem]"
                                      />
                                      <span className="text-white/15 text-sm">–</span>
                                      <input
                                        type="time"
                                        value={entry.to}
                                        onChange={(e) => setSchedule((s) => s.map((d, i) => i === idx ? { ...d, to: e.target.value } : d))}
                                        className="bg-white/[0.06] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-white/20 focus:bg-white/[0.1] transition-all w-[7.5rem]"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-white/15 italic tracking-wide">Closed</span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Right: Calendar & Summary */}
                            <div className="w-[380px] flex-shrink-0 p-6 space-y-5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-1">Calendar & Overrides</p>

                              {/* Calendar */}
                              <div className="bg-white/[0.025] rounded-2xl p-5 border border-white/[0.05]">
                                {/* Month nav */}
                                <div className="flex items-center justify-between mb-3">
                                  <button
                                    type="button"
                                    onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <span className="text-sm font-bold text-white/70">{calMonthLabel}</span>
                                  <button
                                    type="button"
                                    onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                                    className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                                {/* Day headers */}
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                  {DAYS.map((d) => (
                                    <div key={d} className="text-[10px] font-bold text-white/20 text-center py-1">{d}</div>
                                  ))}
                                </div>
                                {/* Date cells */}
                                <div className="grid grid-cols-7 gap-1">
                                  {calendarCells.map((day, i) => {
                                    if (day === null) return <div key={`empty-${i}`} className="w-full aspect-square" />;
                                    const past = isDayInPast(day);
                                    const closed = isDateClosed(day);
                                    const today = new Date();
                                    const isToday = day === today.getDate() && calMonth.getMonth() === today.getMonth() && calMonth.getFullYear() === today.getFullYear();
                                    const hasOverride = Boolean(dateOverrides[toDateStr(day)]);
                                    const isSelected = selectedCalDay === day;
                                    return (
                                      <div key={day} className="relative">
                                        <button
                                          type="button"
                                          disabled={past}
                                          onClick={() => setSelectedCalDay(isSelected ? null : day)}
                                          className={`w-full aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 ${past ? 'text-white/8 cursor-not-allowed' :
                                            isSelected ? 'bg-white/20 text-white font-bold ring-2 ring-white/40 scale-105' :
                                              closed ? 'bg-red-500/70 text-white font-bold ring-1 ring-red-400/30' :
                                                hasOverride ? 'bg-amber-500/40 text-white font-bold ring-1 ring-amber-400/20' :
                                                  isToday ? 'bg-white/12 text-white font-bold ring-1 ring-white/20' :
                                                    'text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                                            }`}
                                        >
                                          {day}
                                          {hasOverride && !closed && !past && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Day editor panel */}
                              {selectedCalDay !== null && !isDayInPast(selectedCalDay) && (() => {
                                const day = selectedCalDay;
                                const ds = toDateStr(day);
                                const closed = isDateClosed(day);
                                const dayOfWeek = new Date(calMonth.getFullYear(), calMonth.getMonth(), day).getDay();
                                const schedIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                                const defaultFrom = schedule[schedIdx]?.from || '12:00';
                                const defaultTo = schedule[schedIdx]?.to || '23:00';
                                const override = dateOverrides[ds];
                                const currentFrom = override?.from || defaultFrom;
                                const currentTo = override?.to || defaultTo;
                                const dateLabel = new Date(calMonth.getFullYear(), calMonth.getMonth(), day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                                return (
                                  <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02]">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${closed ? 'bg-red-500/20 text-red-400' : override ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'}`}>
                                          {day}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-white/80 leading-tight">{dateLabel}</p>
                                          <p className="text-[9px] text-white/25 leading-tight">
                                            {closed ? 'Closed' : override ? 'Custom hours set' : 'Using weekly default'}
                                          </p>
                                        </div>
                                      </div>
                                      <button type="button" onClick={() => setSelectedCalDay(null)} className="p-1 rounded text-white/20 hover:text-white/50 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {!closed && (
                                      <div className="px-4 py-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1">
                                            <p className="text-[9px] text-white/20 mb-1 font-medium uppercase tracking-wider">Opens</p>
                                            <input
                                              type="time"
                                              value={currentFrom}
                                              onChange={(e) => {
                                                const current = override || { from: defaultFrom, to: defaultTo };
                                                setDateOverrides((prev) => ({ ...prev, [ds]: { ...current, from: e.target.value } }));
                                              }}
                                              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-white/20 focus:bg-white/[0.1] transition-all"
                                            />
                                          </div>
                                          <span className="text-white/10 text-sm mt-4">–</span>
                                          <div className="flex-1">
                                            <p className="text-[9px] text-white/20 mb-1 font-medium uppercase tracking-wider">Closes</p>
                                            <input
                                              type="time"
                                              value={currentTo}
                                              onChange={(e) => {
                                                const current = override || { from: defaultFrom, to: defaultTo };
                                                setDateOverrides((prev) => ({ ...prev, [ds]: { ...current, to: e.target.value } }));
                                              }}
                                              className="w-full bg-white/[0.06] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-white/20 focus:bg-white/[0.1] transition-all"
                                            />
                                          </div>
                                        </div>
                                        {override && (
                                          <button
                                            type="button"
                                            onClick={() => setDateOverrides((prev) => { const next = { ...prev }; delete next[ds]; return next; })}
                                            className="flex items-center gap-1 text-[10px] font-medium text-amber-400/50 hover:text-amber-400 transition-colors"
                                          >
                                            <RotateCcw className="w-2.5 h-2.5" />
                                            Reset to default
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          toggleClosedDate(day);
                                          if (!closed) setDateOverrides((prev) => { const next = { ...prev }; delete next[ds]; return next; });
                                        }}
                                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${closed
                                          ? 'text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10'
                                          : 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                                        }`}
                                      >
                                        {closed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        {closed ? 'Reopen' : 'Close day'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedCalDay(null)}
                                        className="text-[11px] font-medium text-white/25 hover:text-white/50 px-2 py-1 transition-colors"
                                      >
                                        Done
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Closed dates pills */}
                              {closedDates.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-red-400/50 uppercase tracking-wider mb-2 px-1">Closed ({closedDates.length})</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {closedDates.sort().map((ds) => {
                                      const d = new Date(ds + 'T00:00:00');
                                      return (
                                        <span key={ds} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-[11px] text-red-400/80 font-medium border border-red-500/10">
                                          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          <button type="button" onClick={() => setClosedDates((p) => p.filter((x) => x !== ds))} className="hover:text-red-300 transition-colors ml-0.5">
                                            <X className="w-3 h-3" />
                                          </button>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Summary */}
                              <div className="bg-white/[0.025] rounded-2xl p-4 border border-white/[0.05] space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] text-white/30 font-medium">Open days</p>
                                  <p className="text-sm font-bold text-white">{schedule.filter((d) => d.open).length}<span className="text-white/25 font-normal">/7</span></p>
                                </div>
                                {closedDates.length > 0 && (
                                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                                    <p className="text-[10px] text-white/30 font-medium">Dates closed</p>
                                    <p className="text-sm font-bold text-red-400/80">{closedDates.length}</p>
                                  </div>
                                )}
                                {Object.keys(dateOverrides).length > 0 && (
                                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                                    <p className="text-[10px] text-white/30 font-medium">Custom overrides</p>
                                    <p className="text-sm font-bold text-amber-400/80">{Object.keys(dateOverrides).length}</p>
                                  </div>
                                )}
                                <div className="pt-2 border-t border-white/[0.04]">
                                  <p className="text-[10px] text-white/30 font-medium mb-1">Schedule preview</p>
                                  <p className="text-xs font-medium text-white/50 leading-relaxed">{formatSchedule(schedule) || '—'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-8 py-4 border-t border-white/[0.06] flex-shrink-0 bg-white/[0.015]">
                          <p className="text-xs text-white/25">
                            {schedule.filter((d) => d.open).length} days open{closedDates.length > 0 ? ` · ${closedDates.length} closed` : ''}{Object.keys(dateOverrides).length > 0 ? ` · ${Object.keys(dateOverrides).length} override${Object.keys(dateOverrides).length > 1 ? 's' : ''}` : ''}
                          </p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setSchedule(defaultSchedule); setClosedDates([]); setEditingHours(false); }}
                              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/60 hover:bg-white/5 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const result = formatSchedule(schedule);
                                const suffix = closedDates.length > 0
                                  ? ` (closed ${closedDates.sort().map((ds) => { const d = new Date(ds + 'T00:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }).join(', ')})`
                                  : '';
                                onHoursChange?.(result + suffix);
                                setEditingHours(false);
                              }}
                              className="px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 flex items-center gap-2 shadow-lg"
                              style={{ backgroundColor: brandColor, boxShadow: `0 4px 20px ${brandColor}30` }}
                            >
                              <Check className="w-4 h-4" />
                              Save Hours
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>, document.body
                  )}
                </div>
              </div>

              {/* Hero CTAs removed for cleaner layout — 3D/AR accessible via dish detail sheet */}
            </div>

            {/* Right — Customize FAB + Saved Layouts dropdown */}
            {onCustomize && (
              <div className="flex-shrink-0 mb-1 relative" ref={presetsDropdownRef}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onCustomize}
                    className="relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl shadow-black/40 transition-all duration-300 hover:scale-105 active:scale-95 group/fab border border-white/15 backdrop-blur-xl"
                    style={{
                      backgroundColor: brandColor,
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.18), transparent 60%)',
                      boxShadow: `0 8px 32px -6px ${brandColor}50`,
                    }}
                    title="Customize menu appearance"
                    aria-label="Open customization panel"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <Paintbrush className="w-4 h-4 text-white transition-transform duration-300 group-hover/fab:rotate-12" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="text-sm font-bold text-white block leading-tight">Customize</span>
                      <span className="text-[10px] text-white/50 leading-tight">Appearance & layout</span>
                    </div>
                    {customizeChangedCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-[10px] font-black flex items-center justify-center shadow-lg"
                        style={{ color: brandColor }}
                      >
                        {customizeChangedCount}
                      </span>
                    )}
                  </button>

                  {/* Saved layouts toggle */}
                  {presets.length > 0 && onLoadPreset && (
                    <button
                      onClick={() => setShowPresets((v) => !v)}
                      className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/15 backdrop-blur-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: showPresets ? 'rgba(255,255,255,0.15)' : `${brandColor}cc`,
                      }}
                      title="Saved layouts"
                      aria-label="Toggle saved layouts"
                    >
                      <FolderOpen className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showPresets && presets.length > 0 && onLoadPreset && (
                  <div
                    className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden"
                    style={{ backgroundColor: 'rgba(24,24,27,0.92)' }}
                  >
                    <div className="px-3 py-2.5 border-b border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Saved Layouts</span>
                    </div>
                    <div className="py-1.5 max-h-[200px] overflow-y-auto">
                      {presets.map((preset) => {
                        const isActive = activePresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              onLoadPreset(preset.id);
                              setShowPresets(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${isActive
                              ? 'bg-white/10 text-white'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            {isActive && (
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: brandColor }}
                              />
                            )}
                            <span className="flex-1 truncate font-medium">{preset.name}</span>
                            {isActive && <Check className="w-3 h-3 text-zinc-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);
MenuHero.displayName = 'MenuHero';

// ─── CategoryTabs ─────────────────────────────────────────────────────────────

interface CategoryTabsProps {
  categories: Category[];
  items: MenuItem[];
  active: string;
  onSelect: (id: string) => void;
  onSearchToggle: () => void;
  brandColor: string;
  isEditMode?: boolean;
  onAddFromLibrary?: (item: MenuItem) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(
  ({ categories, items, active, onSelect, onSearchToggle, brandColor, isEditMode, onAddFromLibrary }) => {
    const { t } = useTranslation();
    const tabsRef = useRef<HTMLDivElement>(null);
    const [showLibrary, setShowLibrary] = useState(false);
    const [librarySearch, setLibrarySearch] = useState('');
    const [libraryCategory, setLibraryCategory] = useState<string>('all');
    const libraryRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const container = tabsRef.current;
      if (!container) return;
      const el = container.querySelector(`[data-cat="${active}"]`) as HTMLElement | null;
      if (!el) return;
      const padding = 16;
      const left = el.offsetLeft - padding;
      const right = el.offsetLeft + el.offsetWidth + padding;
      const viewLeft = container.scrollLeft;
      const viewRight = viewLeft + container.clientWidth;
      if (left < viewLeft) {
        container.scrollTo({ left, behavior: 'smooth' });
      } else if (right > viewRight) {
        container.scrollTo({ left: right - container.clientWidth, behavior: 'smooth' });
      }
    }, [active]);

    useEffect(() => {
      if (!showLibrary) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          libraryRef.current && !libraryRef.current.contains(e.target as Node) &&
          (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node))
        ) {
          setShowLibrary(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLibrary]);

    const filteredLibrary = DISH_LIBRARY.filter((dish) => {
      const alreadyAdded = items.some((i) => i.name === dish.name);
      if (alreadyAdded) return false;
      const matchesSearch = !librarySearch || dish.name.toLowerCase().includes(librarySearch.toLowerCase()) || dish.desc.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesCat = libraryCategory === 'all' || dish.category === libraryCategory;
      return matchesSearch && matchesCat;
    });

    return (
      <>
        <nav
          className="sticky z-40 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/40 transition-colors duration-500"
          style={{ top: '64px', backgroundColor: 'color-mix(in srgb, var(--bg, #09090b) 60%, transparent)' }}
          aria-label="Menu categories"
        >
          <div className="flex items-center gap-2 px-5 md:px-8 max-w-7xl mx-auto">
            <div className="relative flex-1 min-w-0">
              {/* Right fade to indicate scrollable tabs */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950/80 to-transparent pointer-events-none z-10 md:hidden" />
              <div
                ref={tabsRef}
                className="flex-1 flex gap-1 overflow-x-auto scrollbar-none py-3"
                role="tablist"
              >
                {categories.filter((cat) => items.some((i) => i.category === cat.id)).map((cat) => {
                  const count = items.filter((i) => i.category === cat.id).length;
                  const isActive = active === cat.id;
                  return (
                    <button
                      key={cat.id}
                      data-cat={cat.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => onSelect(cat.id)}
                      className="relative flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 group/tab"
                      style={{
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      }}
                    >
                      <span className="font-sans-premium tracking-tight">{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-lg font-black ${isActive ? 'bg-white/10 text-white/50' : 'text-white/20 group-hover/tab:text-white/40'}`}
                      >
                        {count}
                      </span>
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.3)]"
                          style={{ backgroundColor: brandColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 py-2 ml-3 border-l border-white/10 pl-3">
              {isEditMode && onAddFromLibrary && (
                <div className="relative" ref={libraryRef}>
                  <button
                    onClick={() => setShowLibrary((v) => !v)}
                    className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    style={{ backgroundColor: showLibrary ? `${brandColor}15` : undefined, color: showLibrary ? brandColor : undefined }}
                    aria-label="Add dish from library"
                    title="Add from library"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                onClick={onSearchToggle}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                aria-label={t('tpl.menu.searchMenu')}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>
        {showLibrary && createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] w-80 max-h-[420px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
            style={{
              top: (libraryRef.current?.getBoundingClientRect().bottom ?? 0) + 8,
              right: window.innerWidth - (libraryRef.current?.getBoundingClientRect().right ?? 0),
            }}
            role="dialog"
            aria-label="Dish Library"
          >
            <div className="p-3 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Library className="w-4 h-4 text-white/50" />
                <span className="text-sm font-bold text-white/80">Dish Library</span>
              </div>
              <input
                type="text"
                placeholder="Search dishes..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                autoFocus
              />
              <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-none">
                {[{ id: 'all', label: 'All' }, ...categories].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setLibraryCategory(cat.id)}
                    className="flex-shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: libraryCategory === cat.id ? brandColor + '30' : 'rgba(255,255,255,0.05)',
                      color: libraryCategory === cat.id ? brandColor : 'rgba(255,255,255,0.4)',
                      borderWidth: 1,
                      borderColor: libraryCategory === cat.id ? brandColor + '40' : 'transparent',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-6 text-white/30 text-sm">
                  {librarySearch ? 'No matching dishes' : 'All dishes already added'}
                </div>
              ) : (
                filteredLibrary.map((dish) => {
                  const cat = categories.find((c) => c.id === dish.category);
                  return (
                    <button
                      key={dish.id}
                      onClick={() => {
                        onAddFromLibrary?.(dish);
                        setShowLibrary(false);
                        setLibrarySearch('');
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-all group/lib flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: brandColor + '15' }}>
                        <Plus className="w-3.5 h-3.5 opacity-0 group-hover/lib:opacity-100 transition-opacity" style={{ color: brandColor }} />
                        <ChefHat className="w-3.5 h-3.5 absolute opacity-100 group-hover/lib:opacity-0 transition-opacity" style={{ color: brandColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white/80 group-hover/lib:text-white truncate">{dish.name}</span>
                          <span className="text-xs font-bold text-white/30">{dish.price}</span>
                        </div>
                        <p className="text-[11px] text-white/30 truncate mt-0.5">{dish.desc}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {cat && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-medium">{cat.label}</span>
                          )}
                          {dish.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: brandColor + '15', color: brandColor }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }
);
CategoryTabs.displayName = 'CategoryTabs';

// ─── MenuItemCard ─────────────────────────────────────────────────────────────

interface MenuItemCardProps {
  item: MenuItem;
  allItems: MenuItem[];
  brandColor: string;
  showPrices: boolean;
  currency: string;
  fieldVisibility: FieldVisibility;
  onToggleFieldVisibility: (field: keyof FieldVisibility) => void;
  isEditMode: boolean;
  onDetails: () => void;
  onView3D: () => void;
  onLaunchAR?: () => void;
  onUpdate: (field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleHidden?: () => void;
  onReview?: (action: 'approve' | 'reject') => void;
  onDownload?: (type: 'image' | 'model') => void;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  openPanel?: ModalPanel | null;
  onClearPanel?: () => void;
  cardStyle?: CardStyle;
  cardRadius?: CardRadius;
}

const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(
  ({
    item,
    allItems,
    brandColor,
    showPrices,
    currency,
    fieldVisibility,
    onToggleFieldVisibility: _onToggleFieldVisibility,
    isEditMode,
    onDetails,
    onView3D,
    onLaunchAR: _onLaunchAR,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleHidden,
    onReview,
    onDownload,
    isDragOver,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    openPanel,
    onClearPanel,
    cardStyle = 'horizontal',
    cardRadius = 'rounded',
  }) => {
    const { t } = useTranslation();
    const { error: showError } = useToast();
    const [activePanel, setActivePanel] = useState<ModalPanel | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Allow parent to open a specific panel
    useEffect(() => {
      if (openPanel) {
        setActivePanel(openPanel);
        onClearPanel?.();
      }
    }, [openPanel, onClearPanel]);

    // Ensure page scroll is never locked when the popup is open
    useEffect(() => {
      if (activePanel !== null) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }, [activePanel]);

    const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
    const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Clean up copy-feedback timer on unmount
    useEffect(() => {
      return () => {
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      };
    }, []);
    const [allergenDropdownOpen, setAllergenDropdownOpen] = useState(false);
    const allergenDropdownRef = useRef<HTMLDivElement>(null);
    const has3D = Boolean(item.modelUrl);

    // Per-item field visibility: merge global defaults with item-level overrides
    const effectiveFieldVisibility: FieldVisibility = useMemo(() => ({
      ...fieldVisibility,
      ...item.fieldVisibility,
    }), [fieldVisibility, item.fieldVisibility]);

    // Toggle field visibility on this specific item (not globally)
    const handleItemToggleFieldVisibility = useCallback(
      (field: keyof FieldVisibility) => {
        const currentVal = effectiveFieldVisibility[field];
        const updated = { ...(item.fieldVisibility ?? {}), [field]: !currentVal };
        onUpdate('fieldVisibility', updated);
      },
      [effectiveFieldVisibility, item.fieldVisibility, onUpdate]
    );

    const pairsIdsToNames = (ids: string[]) =>
      ids.map((id) => allItems.find((i) => i.id === id)?.name ?? id).join(', ');
    const pairsNamesToIds = (names: string) =>
      names.split(',').map((s) => s.trim()).filter(Boolean).map((name) => {
        const found = allItems.find((i) => i.name.toLowerCase() === name.toLowerCase());
        return found ? found.id : name;
      });

    const [draftItem, setDraftItem] = useState<DraftMenuItem>(() => ({
      ...item,
      tags: item.tags.join(', '),
      allergens: item.allergens.join(', '),
      pairsWell: pairsIdsToNames(item.pairsWell),
    }));

    useEffect(() => {
      if (activePanel === 'edit') {
        setDraftItem({
          ...item,
          tags: item.tags.join(', '),
          allergens: item.allergens.join(', '),
          pairsWell: pairsIdsToNames(item.pairsWell),
        });
      }
    }, [activePanel, item]);

    const handleSaveEdits = () => {
      const changes: MenuItem = {
        ...draftItem,
        tags: draftItem.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        allergens: draftItem.allergens
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        pairsWell: pairsNamesToIds(draftItem.pairsWell),
      };

      (Object.keys(changes) as Array<keyof MenuItem>).forEach((key) => {
        if (JSON.stringify(changes[key]) !== JSON.stringify(item[key])) {
          onUpdate(key, changes[key]);
        }
      });

      setActivePanel(null);
    };

    // Live preview: derive display values from draftItem when editing
    const displayItem: MenuItem = activePanel === 'edit'
      ? {
        ...draftItem,
        tags: draftItem.tags.split(',').map((s) => s.trim()).filter(Boolean),
        allergens: draftItem.allergens.split(',').map((s) => s.trim()).filter(Boolean),
        pairsWell: pairsNamesToIds(draftItem.pairsWell),
      }
      : item;

    const isHidden = item.hidden ?? false;

    const itemUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}#item-${item.id}`
        : '';

    const embedCode = `<iframe src="${itemUrl}" width="400" height="300" frameborder="0" allow="xr-spatial-tracking" allowfullscreen></iframe>`;

    const handleShare = () => {
      if (navigator.share) {
        navigator.share({ title: item.name, text: item.desc, url: itemUrl }).catch(() => { });
      } else {
        navigator.clipboard
          .writeText(itemUrl)
          .then(() => {
            setCopied('link');
            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = setTimeout(() => setCopied(null), 2000);
          })
          .catch(() => {
            showError(t('tpl.menu.clipboardFailed', 'Failed to copy to clipboard'));
          });
      }
    };

    const handleCopyLink = () => {
      navigator.clipboard
        .writeText(itemUrl)
        .then(() => {
          setCopied('link');
          if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
          copiedTimerRef.current = setTimeout(() => setCopied(null), 2000);
        })
        .catch(() => {
          showError(t('tpl.menu.clipboardFailed', 'Failed to copy to clipboard'));
        });
    };

    const handleCopyEmbed = () => {
      navigator.clipboard
        .writeText(embedCode)
        .then(() => {
          setCopied('embed');
          if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
          copiedTimerRef.current = setTimeout(() => setCopied(null), 2000);
        })
        .catch(() => {
          showError(t('tpl.menu.clipboardFailed', 'Failed to copy to clipboard'));
        });
    };

    // Unified keyboard + click-outside handler (single listener per card instead of 4)
    useEffect(() => {
      const needsListeners = dropdownOpen || (isEditMode && activePanel !== null);
      if (!needsListeners) return;

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (dropdownOpen) setDropdownOpen(false);
          else if (activePanel !== null) setActivePanel(null);
        }
      };
      const handleClick = (e: MouseEvent) => {
        if (
          dropdownOpen &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setDropdownOpen(false);
        }
        if (
          allergenDropdownOpen &&
          allergenDropdownRef.current &&
          !allergenDropdownRef.current.contains(e.target as Node)
        ) {
          setAllergenDropdownOpen(false);
        }
      };

      document.addEventListener('keydown', handleKey);
      document.addEventListener('mousedown', handleClick);
      return () => {
        document.removeEventListener('keydown', handleKey);
        document.removeEventListener('mousedown', handleClick);
      };
    }, [dropdownOpen, allergenDropdownOpen, isEditMode, activePanel]);


    const MODAL_TABS = getModalTabs(t);

    return (
      <>
        <DishCardShell
          name={displayItem.name}
          price={showPrices ? displayItem.price.replace('$', currency) : null}
          desc={displayItem.desc}
          tags={displayItem.tags}
          calories={displayItem.calories}
          spiceLevel={displayItem.spiceLevel}
          allergens={displayItem.allergens}
          pairsWell={displayItem.pairsWell.map((p) => {
            const matched = allItems.find((i) => i.id === p);
            return matched ? matched.name : p;
          })}
          fieldVisibility={effectiveFieldVisibility}
          brandColor={brandColor}
          image={item.image}
          hidden={isHidden}
          cardStyle={cardStyle}
          cardRadius={cardRadius}
          dataItemId={item.id}
          articleClassName={`${isDragging ? 'opacity-40 scale-95' : ''} ${isDragOver ? 'ring-2 ring-amber-500/60 border-amber-500/40' : ''}`}
          articleStyle={dropdownOpen ? { zIndex: Z.cardElevated } : undefined}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest('button') ||
              target.closest('input') ||
              target.closest('model-viewer') ||
              target.closest('a')
            ) {
              return;
            }
            if (isEditMode) {
              setActivePanel('edit');
            } else {
              onDetails();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver?.(e);
          }}
          onDrop={(e) => {
            e.preventDefault();
            onDrop?.();
          }}
          beforeImage={
            isEditMode ? (
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', item.id);
                  setIsDragging(true);
                  onDragStart?.();
                }}
                onDragEnd={() => {
                  setIsDragging(false);
                  onDragEnd?.();
                }}
                className="absolute top-3 left-3 lg:top-0 lg:left-0 lg:bottom-0 w-8 flex items-center justify-center z-10 cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-500 transition-colors"
              >
                <GripVertical className="w-5 h-5" />
              </div>
            ) : undefined
          }
          imageBehind={
            has3D && !isEditMode && item.modelUrl ? (
              <Inline3DPreview
                modelUrl={item.modelUrl}
                itemName={item.name}
                brandColor={brandColor}
                onExpand={onView3D}
              />
            ) : undefined
          }
          imageFadesOnHover={has3D && !isEditMode}
          imageOverlay={
            has3D && isEditMode ? (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <ControlsHint pointerEventsNone={false} />
              </div>
            ) : undefined
          }
          imageClassName={has3D && !isEditMode ? 'cursor-pointer' : ''}
          onImageClick={(e) => {
            const target = e.target as HTMLElement;
            if (has3D && !isEditMode && !target.closest('model-viewer')) {
              onView3D();
            }
          }}
          imageRole={has3D && !isEditMode ? 'button' : undefined}
          imageTabIndex={has3D && !isEditMode ? 0 : undefined}
          onImageKeyDown={(e) => {
            if (has3D && !isEditMode && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onView3D();
            }
          }}
          imageAriaLabel={has3D && !isEditMode ? `View ${item.name} in 3D` : undefined}
          contentClassName={has3D ? 'cursor-pointer' : ''}
          contentOnClick={has3D ? (e) => { e.stopPropagation(); onView3D(); } : undefined}
        >
          {/* ── Action Buttons ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* View in 3D button — shown on cards with a 3D model */}
              {has3D && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView3D();
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all hover:brightness-110 active:scale-95 text-white shadow-lg"
                  style={{ backgroundColor: `${brandColor}cc` }}
                  aria-label={`View ${item.name} in 3D`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{t('tpl.menu.viewIn3D', 'View in 3D')}</span>
                </button>
              )}

              {/* Dropdown menu — edit mode */}
              {isEditMode && (
                <div ref={dropdownRef} className="relative">
                  {/* Dropdown trigger button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen((v) => !v);
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition-all"
                    aria-label={t('tpl.menu.moreOptions', 'More options')}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('tpl.menu.more', 'More')}</span>
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 min-w-[200px] max-h-[80vh] bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 overflow-y-auto py-1 animate-slide-down"
                      style={{ zIndex: Z.dropdown }}
                      role="menu"
                      aria-label={t('tpl.menu.moreOptions', 'More options')}
                    >
                      {/* Group 1: Modal triggers */}
                      {MODAL_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activePanel === tab.id;
                        return (
                          <button
                            key={tab.id}
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePanel(tab.id);
                              setDropdownOpen(false);
                            }}
                            className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors ${isActive
                              ? 'bg-white/5'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                              }`}
                            style={isActive ? { color: brandColor } : {}}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{tab.label}</span>
                          </button>
                        );
                      })}

                      {/* Separator */}
                      <div className="h-px bg-white/10 my-1" />

                      {/* Group 2: Content actions */}
                      <button
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate?.();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <CopyPlus className="w-4 h-4" />
                        <span className="font-medium">
                          {t('tpl.menu.duplicate', 'Duplicate')}
                        </span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHidden?.();
                          setDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors ${isHidden
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="font-medium">
                          {isHidden ? t('tpl.menu.show', 'Show') : t('tpl.menu.hide', 'Hide')}
                        </span>
                      </button>

                      {/* Separator */}
                      <div className="h-px bg-white/10 my-1" />

                      {/* Group 3: Destructive action */}
                      <button
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-medium">{t('tpl.menu.delete', 'Delete')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DishCardShell>

        {/* ═══════ Asset Management Popup ═══════ */}
        {isEditMode && activePanel !== null && (
          <AssetManagementModal
            item={item}
            allItems={allItems}
            draftItem={draftItem}
            setDraftItem={setDraftItem}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            brandColor={brandColor}
            showPrices={showPrices}
            currency={currency}
            fieldVisibility={effectiveFieldVisibility}
            onToggleFieldVisibility={handleItemToggleFieldVisibility}
            onSave={handleSaveEdits}
            onDetails={onDetails}
            onView3D={onView3D}
            onShare={handleShare}
            onCopyLink={handleCopyLink}
            onCopyEmbed={handleCopyEmbed}
            copied={copied}
            itemUrl={itemUrl}
            embedCode={embedCode}
            onReview={onReview}
            onDownload={onDownload}
            onToggleHidden={onToggleHidden}
          />
        )}
      </>
    );
  }
);
MenuItemCard.displayName = 'MenuItemCard';

// ─── AssetManagementModal ─────────────────────────────────────────────────────

interface AssetManagementModalProps {
  item: MenuItem;
  allItems: MenuItem[];
  draftItem: DraftMenuItem;
  setDraftItem: React.Dispatch<React.SetStateAction<DraftMenuItem>>;
  activePanel: ModalPanel;
  setActivePanel: (panel: ModalPanel | null) => void;
  brandColor: string;
  showPrices: boolean;
  currency: string;
  fieldVisibility: FieldVisibility;
  onToggleFieldVisibility: (field: keyof FieldVisibility) => void;
  onSave: () => void;
  onDetails: () => void;
  onView3D: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  onCopyEmbed: () => void;
  copied: 'link' | 'embed' | null;
  itemUrl: string;
  embedCode: string;
  onReview?: (action: 'approve' | 'reject') => void;
  onDownload?: (type: 'image' | 'model') => void;
  onToggleHidden?: () => void;
}

function AssetManagementModal({
  item,
  allItems,
  draftItem,
  setDraftItem,
  activePanel,
  setActivePanel,
  brandColor,
  showPrices,
  currency,
  fieldVisibility,
  onToggleFieldVisibility,
  onSave,
  onDetails,
  onView3D,
  onShare: _onShare,
  onCopyLink,
  onCopyEmbed,
  copied,
  itemUrl,
  embedCode,
  onReview: _onReview,
  onDownload: _onDownload,
  onToggleHidden,
}: AssetManagementModalProps) {
  const { t } = useTranslation();
  const MODAL_TABS = getModalTabs(t);
  const has3D = Boolean(item.modelUrl);
  const reviewStatus = item.reviewStatus ?? 'pending';
  const reviewCfg = getReviewConfig(t, reviewStatus);
  const isHidden = item.hidden ?? false;
  const [allergenDropdownOpen, setAllergenDropdownOpen] = useState(false);
  const allergenDropdownRef = useRef<HTMLDivElement>(null);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allergenDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (allergenDropdownRef.current && !allergenDropdownRef.current.contains(e.target as Node)) {
        setAllergenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [allergenDropdownOpen]);

  useEffect(() => {
    if (!tagDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [tagDropdownOpen]);

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none p-4"
      style={{ zIndex: Z.cardModal }}
    >
      {/* Invisible click-catcher for click-outside-to-close */}
      <div
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={() => setActivePanel(null)}
        aria-hidden="true"
      />
      <div
        className="relative pointer-events-auto w-full max-w-5xl max-h-[90vh] bg-stone-900 border border-stone-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-auto flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left column: item showcase ── */}
        <div className="md:w-[320px] flex-shrink-0 bg-stone-950/60 border-b md:border-b-0 md:border-r border-stone-800/60 flex flex-col">
          {/* Image hero */}
          <div className="relative aspect-[4/3] md:aspect-auto md:h-48 bg-stone-800 overflow-hidden">
            <img
              src={draftItem?.image || item.image}
              alt={draftItem?.name || item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {has3D && (
              <div
                className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md text-white uppercase tracking-wider"
                style={{ backgroundColor: `${brandColor}e0` }}
              >
                3D Asset
              </div>
            )}
            {/* Review badge */}
            <div
              className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold backdrop-blur-md ${reviewCfg.bg} ${reviewCfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${reviewCfg.dot}`} />
              {reviewCfg.label}
            </div>
          </div>

          {/* Item info */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-base font-bold text-white leading-tight">
                  {draftItem?.name || item.name}
                </h2>
                {showPrices && fieldVisibility.price && (
                  <span
                    className="text-base font-bold font-mono flex-shrink-0"
                    style={{ color: brandColor }}
                  >
                    {(draftItem?.price || item.price).replace('$', currency)}
                  </span>
                )}
              </div>
              {fieldVisibility.description && (
                <p className="text-xs text-stone-400 leading-relaxed">
                  {draftItem?.desc || item.desc}
                </p>
              )}
            </div>

            {/* Tags */}
            {fieldVisibility.tags && (draftItem?.tags || item.tags).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draftItem.tags
                  .split(',')
                  .filter(Boolean)
                  .map((tag: string) => (
                    <span
                      key={tag.trim()}
                      className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${tagStyle(tag.trim())}`}
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            )}

            {/* Metadata */}
            {(fieldVisibility.calories || fieldVisibility.allergens) && (
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {fieldVisibility.calories && (
                  <div className="bg-stone-800/60 rounded-lg px-2.5 py-1.5 border border-stone-700/30">
                    <span className="text-stone-500 uppercase tracking-wider">
                      {t('tpl.menu.caloriesLabel', 'Calories')}
                    </span>
                    <div className="text-stone-200 font-medium mt-0.5">
                      {draftItem?.calories || item.calories}
                    </div>
                  </div>
                )}
                {fieldVisibility.allergens && (
                  <div className="bg-stone-800/60 rounded-lg px-2.5 py-1.5 border border-stone-700/30">
                    <span className="text-stone-500 uppercase tracking-wider">
                      {t('tpl.menu.allergens', 'Allergens')}
                    </span>
                    <div className="text-stone-200 font-medium mt-0.5">
                      {draftItem?.allergens || item.allergens.join(', ') || '—'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View actions */}
            <div className="flex flex-col gap-2 pt-1">
              {onToggleHidden && (
                <button
                  onClick={onToggleHidden}
                  className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all active:scale-95 ${isHidden
                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border border-amber-500/30'
                    : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/40'
                    }`}
                >
                  {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {isHidden ? t('tpl.menu.show', 'Show on Menu') : t('tpl.menu.hide', 'Hide on Menu')}
                </button>
              )}
              <button
                onClick={() => {
                  onSave();
                  onDetails();
                }}
                className="w-full text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors underline underline-offset-2 text-left"
              >
                {t('tpl.menu.details')}
              </button>
              {has3D && (
                <button
                  onClick={onView3D}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-white transition-all active:scale-95 hover:brightness-110"
                  style={{ backgroundColor: brandColor }}
                >
                  <Box className="w-3.5 h-3.5" />
                  {t('tpl.menu.viewIn3DAR')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: tab strip + panel ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top bar with tabs + close */}
          <div className="flex items-center border-b border-stone-800/60 bg-stone-900/80">
            <div className="flex-1 flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-none">
              {MODAL_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activePanel === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive ? '' : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800/60'
                      }`}
                    style={
                      isActive ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="flex-shrink-0 p-2 mr-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel content area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* ── QR Code ── */}
            {activePanel === 'qr' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {t('tpl.menu.qrCode', 'QR Code')}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {t('tpl.menu.qrDesc', 'Scannable QR code linking directly to this item.')}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 py-4">
                  {/* QR code display */}
                  <QRCodeDisplay
                    url={itemUrl}
                    size="md"
                    label={item.name}
                  />

                  {/* URL */}
                  <code className="text-[10px] text-zinc-500 font-mono max-w-full truncate px-4 py-2 bg-zinc-800/60 rounded-xl border border-zinc-700/30">
                    {itemUrl}
                  </code>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={onCopyLink}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 transition-colors"
                    >
                      {copied === 'link' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied === 'link'
                        ? t('tpl.menu.copied', 'Copied!')
                        : t('tpl.menu.copyLink', 'Copy Link')}
                    </button>
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(itemUrl)}&format=png`}
                      download={`${item.name.replace(/\s+/g, '_')}_QR.png`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white hover:brightness-110 transition-all"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t('tpl.menu.downloadQR', 'Download QR')}
                    </a>
                  </div>

                  {/* Embed code */}
                  <div className="bg-stone-800/40 border border-stone-700/30 rounded-xl p-3 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                        {t('tpl.menu.embedCodeLabel', 'Embed Code')}
                      </div>
                      <button
                        onClick={onCopyEmbed}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/50 transition-colors"
                      >
                        {copied === 'embed' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            {t('tpl.menu.copied', 'Copied!')}
                          </>
                        ) : (
                          <>
                            <Code2 className="w-3 h-3" />
                            {t('tpl.menu.copyCode', 'Copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] text-zinc-500 bg-zinc-900/60 border border-zinc-700/30 rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap break-all leading-relaxed">
                      {embedCode}
                    </pre>
                  </div>
                </div>

              </div>
            )}

            {/* ── Edit Details ── */}
            {activePanel === 'edit' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {t('tpl.menu.editDetails', 'Edit Details')}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t('tpl.menu.editDesc', 'Modify all product information line by line.')}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">
                      {t('tpl.menu.itemName', 'Item Name')}
                    </label>
                    <input
                      type="text"
                      value={draftItem.name}
                      onChange={(e) => setDraftItem((prev) => ({ ...prev, name: e.target.value }))}
                      className={INPUT_CLASS}
                      style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                      placeholder="e.g., Wagyu Burger"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">
                      {t('tpl.menu.category', 'Category')}
                    </label>
                    <select
                      value={draftItem.category}
                      onChange={(e) =>
                        setDraftItem((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className={!fieldVisibility.description ? 'opacity-50' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.description', 'Description')}
                      </label>
                      <button
                        type="button"
                        onClick={() => onToggleFieldVisibility('description')}
                        className="p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700/50 transition-colors"
                        title={fieldVisibility.description ? 'Hide on menu' : 'Show on menu'}
                      >
                        {fieldVisibility.description ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <textarea
                      value={draftItem.desc}
                      onChange={(e) => setDraftItem((prev) => ({ ...prev, desc: e.target.value }))}
                      rows={3}
                      className={`${INPUT_CLASS} resize-none`}
                      style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                      placeholder="Detailed description of the item..."
                    />
                  </div>

                  {/* Price */}
                  <div className={!fieldVisibility.price ? 'opacity-50' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.price', 'Price')}
                      </label>
                      <button
                        type="button"
                        onClick={() => onToggleFieldVisibility('price')}
                        className="p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700/50 transition-colors"
                        title={fieldVisibility.price ? 'Hide on menu' : 'Show on menu'}
                      >
                        {fieldVisibility.price ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={draftItem.price}
                      onChange={(e) => setDraftItem((prev) => ({ ...prev, price: e.target.value }))}
                      className={INPUT_CLASS}
                      style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                      placeholder="e.g., $24"
                    />
                  </div>

                  {/* Calories */}
                  <div className={!fieldVisibility.calories ? 'opacity-50' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.calories', 'Calories')}
                      </label>
                      <button
                        type="button"
                        onClick={() => onToggleFieldVisibility('calories')}
                        className="p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700/50 transition-colors"
                        title={fieldVisibility.calories ? 'Hide on menu' : 'Show on menu'}
                      >
                        {fieldVisibility.calories ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={draftItem.calories}
                      onChange={(e) =>
                        setDraftItem((prev) => ({ ...prev, calories: e.target.value }))
                      }
                      className={INPUT_CLASS}
                      style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                      placeholder="e.g., 650"
                    />
                  </div>

                  {/* Tags */}
                  <div className={!fieldVisibility.tags ? 'opacity-50' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.tags', 'Tags')}
                      </label>
                      <button
                        type="button"
                        onClick={() => onToggleFieldVisibility('tags')}
                        className="p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700/50 transition-colors"
                        title={fieldVisibility.tags ? 'Hide on menu' : 'Show on menu'}
                      >
                        {fieldVisibility.tags ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div ref={tagDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setTagDropdownOpen((v) => !v)}
                        className={`${INPUT_CLASS} flex items-center justify-between gap-2 text-left w-full`}
                        style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                      >
                        <span className={draftItem.tags ? 'text-white truncate' : 'text-stone-500 truncate'}>
                          {draftItem.tags || 'Select tags...'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 flex-shrink-0 transition-transform ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Selected pills */}
                      {draftItem.tags && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {draftItem.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = draftItem.tags
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter((s) => s && s !== tag)
                                    .join(', ');
                                  setDraftItem((prev) => ({ ...prev, tags: updated }));
                                }}
                                className="hover:text-brand-300 transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dropdown */}
                      {tagDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-700/60 rounded-lg shadow-xl shadow-black/40 max-h-48 overflow-y-auto scrollbar-none">
                          {COMMON_TAGS.map((tag) => {
                            const selected = draftItem.tags
                              .split(',')
                              .map((s) => s.trim())
                              .includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const current = draftItem.tags
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const updated = selected
                                    ? current.filter((t) => t !== tag)
                                    : [...current, tag];
                                  setDraftItem((prev) => ({
                                    ...prev,
                                    tags: updated.join(', '),
                                  }));
                                }}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${selected
                                  ? 'bg-brand-500/10 text-brand-400'
                                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                                  }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${selected ? 'border-brand-500 bg-brand-500' : 'border-stone-600'
                                  }`}>
                                  {selected && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allergens */}
                  <div className={!fieldVisibility.allergens ? 'opacity-50' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.allergens', 'Allergens')}
                      </label>
                      <button
                        type="button"
                        onClick={() => onToggleFieldVisibility('allergens')}
                        className="p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700/50 transition-colors"
                        title={fieldVisibility.allergens ? 'Hide on menu' : 'Show on menu'}
                      >
                        {fieldVisibility.allergens ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div ref={allergenDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setAllergenDropdownOpen((v) => !v)}
                        className={`${INPUT_CLASS} flex items-center justify-between gap-2 text-left w-full`}
                        style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                      >
                        <span className={draftItem.allergens ? 'text-white truncate' : 'text-stone-500 truncate'}>
                          {draftItem.allergens || 'Select allergens...'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 flex-shrink-0 transition-transform ${allergenDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Selected pills */}
                      {draftItem.allergens && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {draftItem.allergens.split(',').map((a) => a.trim()).filter(Boolean).map((allergen) => (
                            <span
                              key={allergen}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium"
                            >
                              {allergen}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = draftItem.allergens
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter((s) => s && s !== allergen)
                                    .join(', ');
                                  setDraftItem((prev) => ({ ...prev, allergens: updated }));
                                }}
                                className="hover:text-red-300 transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dropdown */}
                      {allergenDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-700/60 rounded-lg shadow-xl shadow-black/40 max-h-48 overflow-y-auto scrollbar-none">
                          {COMMON_ALLERGENS.map((allergen) => {
                            const selected = draftItem.allergens
                              .split(',')
                              .map((s) => s.trim())
                              .includes(allergen);
                            return (
                              <button
                                key={allergen}
                                type="button"
                                onClick={() => {
                                  const current = draftItem.allergens
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const updated = selected
                                    ? current.filter((a) => a !== allergen)
                                    : [...current, allergen];
                                  setDraftItem((prev) => ({
                                    ...prev,
                                    allergens: updated.join(', '),
                                  }));
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${selected
                                  ? 'text-red-400 bg-red-500/5'
                                  : 'text-stone-300 hover:bg-stone-800/80'
                                  }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selected
                                  ? 'bg-red-500/20 border-red-500/40'
                                  : 'border-stone-600 bg-stone-800/60'
                                  }`}>
                                  {selected && <Check className="w-2.5 h-2.5" />}
                                </span>
                                {allergen}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pairs Well */}
                  <div className={!fieldVisibility.pairsWell ? 'opacity-50' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.pairsWell', 'Pairs Well With')}
                      </label>
                      <button
                        type="button"
                        onClick={() => onToggleFieldVisibility('pairsWell')}
                        className="p-1 rounded-md text-stone-500 hover:text-white hover:bg-stone-700/50 transition-colors"
                        title={fieldVisibility.pairsWell ? 'Hide on menu' : 'Show on menu'}
                      >
                        {fieldVisibility.pairsWell ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {(() => {
                      const selectedNames = draftItem.pairsWell.split(',').map((s) => s.trim()).filter(Boolean);
                      const otherItems = allItems.filter((i) => i.id !== item.id);
                      const toggleItem = (name: string) => {
                        const current = draftItem.pairsWell.split(',').map((s) => s.trim()).filter(Boolean);
                        const next = current.includes(name)
                          ? current.filter((n) => n !== name)
                          : [...current, name];
                        setDraftItem((prev) => ({ ...prev, pairsWell: next.join(', ') }));
                      };
                      return (
                        <details className="group">
                          <summary
                            className={`${INPUT_CLASS} cursor-pointer list-none flex items-center justify-between`}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                          >
                            <span className={`truncate ${selectedNames.length === 0 ? 'text-stone-500' : 'text-white'}`}>
                              {selectedNames.length === 0
                                ? 'Select dishes...'
                                : `${selectedNames.length} selected`}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="mt-1 max-h-[160px] overflow-y-auto rounded-lg border border-stone-700/40 bg-stone-800/80 scrollbar-thin">
                            {otherItems.map((other) => {
                              const isChecked = selectedNames.some((n) => n.toLowerCase() === other.name.toLowerCase());
                              return (
                                <button
                                  key={other.id}
                                  type="button"
                                  onClick={() => toggleItem(other.name)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors"
                                >
                                  <div
                                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isChecked
                                      ? 'border-transparent'
                                      : 'border-stone-600 bg-stone-700/50'
                                      }`}
                                    style={isChecked ? { backgroundColor: brandColor } : undefined}
                                  >
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className={`truncate ${isChecked ? 'text-white font-medium' : 'text-stone-400'}`}>
                                    {other.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </details>
                      );
                    })()}
                  </div>

                  {/* ── Marketplace ─────────────────────── */}
                  <div className="pt-3 mt-1 border-t border-stone-800/40">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-stone-400">
                        {t('tpl.menu.marketplace', 'List on Model Library')}
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={draftItem.marketplace_listed ?? false}
                        onClick={() =>
                          setDraftItem((prev) => ({
                            ...prev,
                            marketplace_listed: !prev.marketplace_listed,
                          }))
                        }
                        className={`relative w-10 h-5 rounded-full transition-colors ${draftItem.marketplace_listed
                          ? 'bg-emerald-600'
                          : 'bg-stone-700'
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${draftItem.marketplace_listed ? 'translate-x-5' : ''
                            }`}
                        />
                      </button>
                    </div>

                    {draftItem.marketplace_listed && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-400 mb-1.5">
                            {t('tpl.menu.marketplacePrice', 'Sale Price (EUR)')}
                          </label>
                          <input
                            type="text"
                            value={draftItem.marketplace_price ?? ''}
                            onChange={(e) =>
                              setDraftItem((prev) => ({ ...prev, marketplace_price: e.target.value }))
                            }
                            className={INPUT_CLASS}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                            placeholder="e.g., 149"
                          />
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {t('tpl.menu.marketplaceSplit', 'You earn 50% of every sale')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Save action */}
                  <div className="pt-4 pb-2 border-t border-stone-800/40 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-stone-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {t('tpl.menu.unsavedChanges', 'You have unsaved changes')}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePanel(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-stone-900"
                      >
                        {t('tpl.menu.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSave();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-stone-900"
                        style={{
                          backgroundColor: brandColor,
                          boxShadow: `0 8px 20px -4px ${brandColor}40`,
                        }}
                      >
                        <Check className="w-4 h-4" />
                        {t('tpl.menu.saveChanges', 'Save Changes')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── MenuSection ──────────────────────────────────────────────────────────────

interface MenuSectionProps {
  category: Category;
  items: MenuItem[];
  allItems: MenuItem[];
  brandColor: string;
  showPrices: boolean;
  currency: string;
  fieldVisibility: FieldVisibility;
  onToggleFieldVisibility: (field: keyof FieldVisibility) => void;
  isEditMode: boolean;
  sectionRef: (el: HTMLElement | null) => void;
  onDetails: (item: MenuItem) => void;
  onView3D: (item: MenuItem) => void;
  onLaunchAR: (item: MenuItem) => void;
  onUpdate: (id: string, field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onReview: (id: string, action: 'approve' | 'reject') => void;
  onDownload: (id: string, type: 'image' | 'model') => void;
  onReorder: (fromId: string, toId: string) => void;
  pendingPanel: { itemId: string; panel: ModalPanel } | null;
  onClearPanel: () => void;
  cardLayout?: CardLayout;
  cardStyle?: CardStyle;
  spacing?: MenuSpacing;
  cardRadius?: CardRadius;
}

const MenuSection: React.FC<MenuSectionProps> = React.memo(
  ({
    category,
    items,
    allItems,
    brandColor,
    showPrices,
    currency,
    fieldVisibility,
    onToggleFieldVisibility,
    isEditMode,
    sectionRef,
    onDetails,
    onView3D,
    onLaunchAR,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleHidden,
    onReview,
    onDownload,
    onReorder,
    pendingPanel,
    onClearPanel,
    cardLayout = 'grid',
    cardStyle = 'horizontal',
    spacing = 'default',
    cardRadius = 'rounded',
  }) => {
    const [dragSourceId, setDragSourceId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const spacingClasses: Record<MenuSpacing, string> = {
      compact: 'gap-2 md:gap-3',
      default: 'gap-4 md:gap-6',
      spacious: 'gap-6 md:gap-10',
    };

    const gridClasses = cardLayout === 'grid'
      ? `grid grid-cols-1 lg:grid-cols-2 ${spacingClasses[spacing]}`
      : `grid grid-cols-1 max-w-3xl mx-auto ${spacingClasses[spacing]}`;

    const sectionSpacing: Record<MenuSpacing, string> = {
      compact: 'mb-5 md:mb-8',
      default: 'mb-10 md:mb-14',
      spacious: 'mb-12 md:mb-16',
    };

    return (
      <section ref={sectionRef} id={`cat-${category.id}`} aria-labelledby={`heading-${category.id}`}>
        <div className={`${sectionSpacing[spacing]} relative`}>
          {/* Subtle background glow for section heading */}
          <div className="absolute inset-0 bg-brand-500/5 blur-[50px] rounded-full pointer-events-none -z-10" />

          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h2
              id={`heading-${category.id}`}
              className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-sm"
            >
              {category.label}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <p className="text-base md:text-lg text-zinc-400 text-center font-medium max-w-2xl mx-auto">{category.desc}</p>
        </div>
        <StaggerContainer viewport={false} className={gridClasses}>
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <MenuItemCard
                item={item}
                allItems={allItems}
                brandColor={brandColor}
                showPrices={showPrices}
                currency={currency}
                fieldVisibility={fieldVisibility}
                onToggleFieldVisibility={onToggleFieldVisibility}
                isEditMode={isEditMode}
                onDetails={() => onDetails(item)}
                onView3D={() => onView3D(item)}
                onLaunchAR={() => onLaunchAR(item)}
                onUpdate={(field, value) => onUpdate(item.id, field, value)}
                onDelete={() => onDelete(item.id)}
                onDuplicate={() => onDuplicate(item.id)}
                onToggleHidden={() => onToggleHidden(item.id)}
                onReview={(action) => onReview(item.id, action)}
                onDownload={(type) => onDownload(item.id, type)}
                openPanel={pendingPanel?.itemId === item.id ? pendingPanel.panel : null}
                onClearPanel={onClearPanel}
                cardStyle={cardStyle}
                cardRadius={cardRadius}
                isDragOver={dragOverId === item.id && dragSourceId !== item.id}
                onDragStart={() => setDragSourceId(item.id)}
                onDragEnd={() => {
                  setDragSourceId(null);
                  setDragOverId(null);
                }}
                onDragOver={() => setDragOverId(item.id)}
                onDrop={() => {
                  if (dragSourceId && dragSourceId !== item.id) {
                    onReorder(dragSourceId, item.id);
                  }
                  setDragSourceId(null);
                  setDragOverId(null);
                }}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    );
  }
);
MenuSection.displayName = 'MenuSection';

// ─── ItemDetailsSheet ─────────────────────────────────────────────────────────

interface ItemDetailsSheetProps {
  item: MenuItem | null;
  allItems: MenuItem[];
  brandColor: string;
  showPrices: boolean;
  currency: string;
  onClose: () => void;
  onView3D: () => void;
  onSelectItem: (item: MenuItem) => void;
}

const ItemDetailsSheet: React.FC<ItemDetailsSheetProps> = ({
  item,
  allItems,
  brandColor,
  showPrices,
  currency,
  onClose,
  onView3D,
  onSelectItem,
}) => {
  const { t } = useTranslation();
  const open = Boolean(item);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: item?.name ?? '', url }).catch(() => { });
    else navigator.clipboard.writeText(url).catch(() => { });
  };

  const relatedItems = item
    ? (item.pairsWell.map((id) => allItems.find((i) => i.id === id)).filter(Boolean) as MenuItem[])
    : [];

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none p-4"
      style={{ zIndex: Z.detailsBackdrop }}
    >
      <div
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="false"
        aria-label={item?.name ?? 'Item details'}
        style={{ zIndex: Z.detailsSheet }}
        className="relative pointer-events-auto w-[min(720px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] overflow-auto rounded-2xl bg-zinc-950 shadow-2xl shadow-black border border-white/10"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/95 backdrop-blur-md">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-base font-bold text-white truncate mx-4 font-sans-premium tracking-tight">{item?.name}</span>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div>
          {item && (
            <>
              <div
                className={`group relative aspect-video w-full bg-zinc-900 overflow-hidden ${item.modelUrl ? 'cursor-pointer' : ''}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (item.modelUrl && !target.closest('model-viewer')) {
                    onView3D();
                  }
                }}
                role={item.modelUrl ? 'button' : undefined}
                tabIndex={item.modelUrl ? 0 : undefined}
                onKeyDown={(e) => {
                  if (item.modelUrl && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onView3D();
                  }
                }}
                aria-label={item.modelUrl ? `View ${item.name} in 3D` : undefined}
              >
                {/* Static Image - fades out on hover when 3D available */}
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${item.modelUrl ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                    }`}
                  loading="lazy"
                />

                {/* Interactive 3D Preview - appears on hover */}
                {item.modelUrl && (
                  <Inline3DPreview
                    modelUrl={item.modelUrl}
                    itemName={item.name}
                    brandColor={brandColor}
                    onExpand={onView3D}
                    expandAsButton
                  />
                )}

                {/* AR READY Badge */}
                {item.modelUrl && (
                  <div
                    className="absolute top-4 left-4 text-[10px] font-black px-3 py-1.5 rounded-xl text-white uppercase tracking-widest shadow-2xl backdrop-blur-xl border border-white/10 z-10"
                    style={{ backgroundColor: `${brandColor}dd` }}
                  >
                    <div className="flex items-center gap-2">
                      <Box className="w-3.5 h-3.5" />
                      {t('tpl.menu.arReady', 'AR READY')}
                    </div>
                  </div>
                )}
              </div>

              <DishCardContent
                name={item.name}
                price={showPrices ? item.price.replace('$', currency) : null}
                desc={item.desc}
                tags={item.tags}
                calories={item.calories}
                allergens={item.allergens}
                pairsWell={item.pairsWell.map((id) => {
                  const matched = allItems.find((i) => i.id === id);
                  return matched ? matched.name : id;
                })}
                variant="detail"
                brandColor={brandColor}
                className="p-5"
              >
                {/* Related items thumbnails */}
                {relatedItems.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                      {t('tpl.menu.pairsWellWith')}
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                      {relatedItems.map((rel) => (
                        <button
                          key={rel.id}
                          onClick={() => onSelectItem(rel)}
                          className="flex-shrink-0 flex flex-col gap-2.5 w-28 group/rel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl snap-start text-left"
                        >
                          <div className="w-28 h-28 rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shadow-lg relative">
                            <img
                              src={rel.image}
                              alt={rel.name}
                              className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                          </div>
                          <span className="text-xs font-bold text-zinc-400 group-hover/rel:text-white transition-colors line-clamp-2 leading-tight">
                            {rel.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 pb-6 mt-4 border-t border-white/5">
                  {item.modelUrl && (
                    <button
                      onClick={onView3D}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-brand-500/20 group/btn"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Box className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      {t('tpl.menu.viewIn3D')}
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-sm font-bold text-zinc-300 bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('tpl.menu.share')}
                  </button>
                </div>
              </DishCardContent>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── OverlayMoreMenu ──────────────────────────────────────────────────────────

interface OverlayMoreMenuProps {
  item: MenuItem;
  brandColor: string;
  onSetActivePanel?: (panel: ModalPanel) => void;
  onDuplicate?: () => void;
  onToggleHidden?: () => void;
  onDelete?: () => void;
}

const OverlayMoreMenu: React.FC<OverlayMoreMenuProps> = ({
  item,
  brandColor: _brandColor,
  onSetActivePanel,
  onDuplicate: _onDuplicate,
  onToggleHidden: _onToggleHidden,
  onDelete: _onDelete,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const _isHidden = item.hidden ?? false;
  const MODAL_TABS = getModalTabs(t);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900/60 border border-white/5 hover:bg-zinc-800 hover:text-white transition-colors"
        aria-label={t('tpl.menu.moreOptions', 'More options')}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="w-3.5 h-3.5" />
        {t('tpl.menu.more', 'More')}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 max-h-[60vh] bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 overflow-y-auto py-1"
          style={{ zIndex: Z.dropdown }}
          role="menu"
          aria-label={t('tpl.menu.moreOptions', 'More options')}
        >
          {/* Group 1: Modal panel triggers */}
          {MODAL_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="menuitem"
                onClick={() => {
                  onSetActivePanel?.(tab.id);
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}


        </div>
      )}
    </div>
  );
};

// ─── ModelViewerOverlay ───────────────────────────────────────────────────────

interface ModelViewerOverlayProps {
  item: MenuItem;
  items: MenuItem[];
  allItems: MenuItem[];
  currentIndex: number;
  brandColor: string;
  showPrices: boolean;
  currency: string;
  isEditMode: boolean;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
  onSelectItem: (item: MenuItem) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleHidden?: () => void;
  onUpdate?: (field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => void;
  onDownload?: (type: 'image' | 'model') => void;
  fieldVisibility: FieldVisibility;
}

const ModelViewerOverlay: React.FC<ModelViewerOverlayProps> = ({
  item,
  items,
  allItems,
  currentIndex,
  brandColor,
  showPrices,
  currency,
  isEditMode,
  onClose,
  onNavigate,
  onSelectItem,
  onDelete,
  onDuplicate,
  onToggleHidden,
  onUpdate,
  onDownload: _onDownload,
  fieldVisibility,
}) => {
  const { t } = useTranslation();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modelViewerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [lighting, setLighting] = useState<'studio' | 'natural'>('studio');
  const [showHints, setShowHints] = useState(() => !sessionStorage.getItem('mv-hints-shown'));

  // Scroll to top when the overlay opens or item changes
  useEffect(() => {
    requestAnimationFrame(() => {
      overlayRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [item.id]);

  // ── 3D Settings state ──
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [modelScale, setModelScale] = useState({ x: 1, y: 1, z: 1 });
  const [uniformScale, setUniformScale] = useState(1);
  const [useUniformScale, setUseUniformScale] = useState(true);
  const [exposureVal, setExposureVal] = useState(0.9);
  const [shadowIntensity, setShadowIntensity] = useState(1.0);
  const [shadowSoftness, setShadowSoftness] = useState(0.6);
  const [fieldOfView, setFieldOfView] = useState(30);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(18);
  const [settingsOverridden, setSettingsOverridden] = useState(false);

  // ── Self-rotation (model spins around its own axis) ──
  const [selfRotateEnabled, setSelfRotateEnabled] = useState(false);
  const [selfRotateAxis, setSelfRotateAxis] = useState<'x' | 'y' | 'z'>('y');
  const [selfRotateSpeed, setSelfRotateSpeed] = useState(30);
  const [selfRotateReverse, setSelfRotateReverse] = useState(false);
  const selfRotateAngleRef = useRef(0);
  const selfRotateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep latest values in refs so the interval callback always reads current values
  const selfRotateParamsRef = useRef({ axis: 'y' as 'x' | 'y' | 'z', speed: 30, reverse: false, rotation: { x: 0, y: 0, z: 0 } });
  selfRotateParamsRef.current = { axis: selfRotateAxis, speed: selfRotateSpeed, reverse: selfRotateReverse, rotation };

  // Self-rotation animation — uses setInterval to imperatively update model-viewer.
  // Overrides the element's orientation property descriptor to prevent React 19 from
  // resetting it on re-renders while the animation loop is active.
  useEffect(() => {
    if (!selfRotateEnabled) {
      if (selfRotateIntervalRef.current) {
        clearInterval(selfRotateIntervalRef.current);
        selfRotateIntervalRef.current = null;
      }
      // Restore the prototype's orientation property so React can manage it again
      const mv = modelViewerRef.current;
      if (mv && Object.getOwnPropertyDescriptor(mv, 'orientation')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- model-viewer Web Component dynamic property access
        delete (mv as any).orientation;
        // Re-apply the static value so model-viewer picks it up
        const { rotation: rot } = selfRotateParamsRef.current;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- model-viewer Web Component dynamic property access
        (mv as any).orientation = `${rot.x}deg ${rot.y}deg ${rot.z}deg`;
      }
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- model-viewer Web Component dynamic property access
    const mv = modelViewerRef.current as any;
    if (!mv) return;

    // Shadow the prototype's orientation setter on this instance so React's
    // re-renders (which set the prop to the static value) are silently ignored.
    let currentOrientation = mv.orientation || '0deg 0deg 0deg';
    Object.defineProperty(mv, 'orientation', {
      get() { return currentOrientation; },
      set(val: string) {
        // Accept values from the animation (they include the animated angle),
        // but block React's static "0deg 0deg 0deg" writes.
        currentOrientation = val;
        // Forward to the prototype setter to actually apply the transform
        const proto = Object.getPrototypeOf(mv);
        const protoDesc = Object.getOwnPropertyDescriptor(proto, 'orientation');
        if (protoDesc?.set) protoDesc.set.call(mv, val);
      },
      configurable: true,
      enumerable: true,
    });

    selfRotateIntervalRef.current = setInterval(() => {
      const { axis, speed, reverse, rotation: rot } = selfRotateParamsRef.current;
      const dir = reverse ? -1 : 1;
      selfRotateAngleRef.current = (selfRotateAngleRef.current + speed * (16 / 1000) * dir) % 360;

      const rx = axis === 'x' ? rot.x + selfRotateAngleRef.current : rot.x;
      const ry = axis === 'y' ? rot.y + selfRotateAngleRef.current : rot.y;
      const rz = axis === 'z' ? rot.z + selfRotateAngleRef.current : rot.z;
      mv.orientation = `${rx}deg ${ry}deg ${rz}deg`;
    }, 16);

    return () => {
      if (selfRotateIntervalRef.current) {
        clearInterval(selfRotateIntervalRef.current);
        selfRotateIntervalRef.current = null;
      }
      // Restore prototype property
      if (Object.getOwnPropertyDescriptor(mv, 'orientation')) {
        delete mv.orientation;
      }
    };
  }, [selfRotateEnabled]);

  useEffect(() => {
    setModelLoaded(false);
    setModelError(false);
  }, [item.id]);

  // Wire up load/error events via addEventListener for custom element compatibility
  useEffect(() => {
    const el = modelViewerRef.current;
    if (!el) return;
    const onLoad = () => setModelLoaded(true);
    const onError = () => setModelError(true);
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
  }, [item.id]);

  useEffect(() => {
    if (!showHints) return;
    const hintTimer = setTimeout(() => {
      sessionStorage.setItem('mv-hints-shown', '1');
      setShowHints(false);
    }, 4500);
    return () => clearTimeout(hintTimer);
  }, [showHints]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNavigate]);

  const handleAR = () => {
    const viewer = modelViewerRef.current as (HTMLElement & { activateAR?: () => void }) | null;
    viewer?.activateAR?.();
  };

  const resetSettings = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setModelScale({ x: 1, y: 1, z: 1 });
    setUniformScale(1);
    setUseUniformScale(true);
    setExposureVal(lighting === 'studio' ? 0.9 : 1.4);
    setShadowIntensity(1.0);
    setShadowSoftness(0.6);
    setFieldOfView(30);
    setAutoRotate(true);
    setRotationSpeed(18);
    setSelfRotateEnabled(false);
    setSelfRotateAxis('y');
    setSelfRotateSpeed(30);
    setSelfRotateReverse(false);
    selfRotateAngleRef.current = 0;
    setSettingsOverridden(false);
  };

  const handleReset = () => {
    modelViewerRef.current?.setAttribute('camera-orbit', '45deg 75deg 105%');
    resetSettings();
  };

  // ── Panel state for right-side management views ──
  const pairsIdsToNames = (ids: string[]) =>
    ids.map((id) => allItems.find((i) => i.id === id)?.name ?? id).join(', ');
  const pairsNamesToIds = (names: string) =>
    names.split(',').map((s) => s.trim()).filter(Boolean).map((name) => {
      const found = allItems.find((i) => i.name.toLowerCase() === name.toLowerCase());
      return found ? found.id : name;
    });

  const [activePanel, setActivePanel] = useState<ModalPanel | null>(null);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [draftItem, setDraftItem] = useState<DraftMenuItem>(() => ({
    ...item,
    tags: item.tags.join(', '),
    allergens: item.allergens.join(', '),
    pairsWell: pairsIdsToNames(item.pairsWell),
  }));
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [allergenDropdownOpen, setAllergenDropdownOpen] = useState(false);
  const allergenDropdownRef = useRef<HTMLDivElement>(null);

  // Clean up copy-feedback timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  // Reset draft + panel when item changes
  useEffect(() => {
    setDraftItem({
      ...item,
      tags: item.tags.join(', '),
      allergens: item.allergens.join(', '),
      pairsWell: pairsIdsToNames(item.pairsWell),
    });
    setActivePanel(null);
    resetSettings();
  }, [item.id]);

  useEffect(() => {
    if (!allergenDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (allergenDropdownRef.current && !allergenDropdownRef.current.contains(e.target as Node)) {
        setAllergenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [allergenDropdownOpen]);

  const MODAL_TABS = getModalTabs(t);
  const _has3D = Boolean(item.modelUrl);
  const itemUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#item-${item.id}`
    : '';
  const embedCode = `<iframe src="${itemUrl}" width="400" height="300" frameborder="0" allow="xr-spatial-tracking" allowfullscreen></iframe>`;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: item.name, url }).catch(() => { });
    else navigator.clipboard.writeText(url).catch(() => { });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(itemUrl).then(() => {
      setCopied('link');
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(null), 2000);
    }).catch(() => { });
  };

  const _handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied('embed');
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(null), 2000);
    }).catch(() => { });
  };

  const handleSaveEdits = () => {
    const changes: MenuItem = {
      ...draftItem,
      tags: draftItem.tags.split(',').map((s) => s.trim()).filter(Boolean),
      allergens: draftItem.allergens.split(',').map((s) => s.trim()).filter(Boolean),
      pairsWell: pairsNamesToIds(draftItem.pairsWell),
    };
    (Object.keys(changes) as Array<keyof MenuItem>).forEach((key) => {
      if (JSON.stringify(changes[key]) !== JSON.stringify(item[key])) {
        onUpdate?.(key, changes[key]);
      }
    });
    setActivePanel(null);
  };

  // Live preview: when editing, derive display values from draftItem so the detail panel updates in real-time
  const displayItem: MenuItem = activePanel === 'edit'
    ? {
      ...draftItem,
      tags: draftItem.tags.split(',').map((s) => s.trim()).filter(Boolean),
      allergens: draftItem.allergens.split(',').map((s) => s.trim()).filter(Boolean),
      pairsWell: pairsNamesToIds(draftItem.pairsWell),
    }
    : item;

  const relatedItems = displayItem.pairsWell
    .map((id) => allItems.find((i) => i.id === id))
    .filter(Boolean) as MenuItem[];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-zinc-900/98 backdrop-blur-md flex flex-col overflow-y-auto"
      style={{ zIndex: Z.viewerOverlay }}
      role="dialog"
      aria-modal="true"
      aria-label={`3D viewer: ${displayItem.name}`}
    >
      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-2xl border border-white/15 text-zinc-200 hover:text-white transition-all font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={t('tpl.menu.closeViewer')}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">{t('shared.back')}</span>
        </button>

        <span className="text-base font-black font-serif-premium text-white truncate max-w-[40%] text-center tracking-tight">
          {item.name}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-white/50 bg-zinc-900/60 backdrop-blur-2xl px-3 py-1.5 rounded-xl border border-white/10">
            {currentIndex + 1} <span className="opacity-40">/ {items.length}</span>
          </span>
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur-2xl border border-white/10 text-zinc-400 hover:text-white transition-all hidden md:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main Content: 3D Viewer (left) + Details (right) ── */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-start min-h-0">
        {/* ── Left: 3D Viewer ── */}
        <div className="relative flex-1 min-w-0">
          <div
            className="relative w-full h-[40vh] lg:h-[calc((100dvh-57px)*0.8)] overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, #292524 0%, #0c0a09 70%)' }}
          >
            {!modelError ? (
              <model-viewer
                ref={(el: HTMLElement | null) => {
                  modelViewerRef.current = el;
                }}
                key={item.id}
                src={item.modelUrl}
                alt={`3D model of ${item.name}`}
                auto-rotate={autoRotate ? true : undefined}
                auto-rotate-delay="600"
                rotation-per-second={`${rotationSpeed}deg`}
                camera-controls
                camera-orbit="45deg 75deg 105%"
                min-camera-orbit="auto auto 50%"
                max-camera-orbit="auto auto 200%"
                orientation={`${rotation.x}deg ${rotation.y}deg ${rotation.z}deg`}
                scale={useUniformScale ? `${uniformScale} ${uniformScale} ${uniformScale}` : `${modelScale.x} ${modelScale.y} ${modelScale.z}`}
                field-of-view={`${fieldOfView}deg`}
                shadow-intensity={String(shadowIntensity)}
                shadow-softness={String(shadowSoftness)}
                exposure={settingsOverridden ? String(exposureVal) : (lighting === 'studio' ? '0.9' : '1.4')}
                ar
                ar-modes="webxr scene-viewer quick-look"
                touch-action="pan-y"
                interaction-prompt="none"
                loading="eager"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-48 h-48 rounded-3xl object-cover opacity-50 shadow-2xl"
                  loading="lazy"
                />
                <p className="text-zinc-400 font-medium">{t('tpl.menu.previewUnavailable')}</p>
                <button
                  onClick={() => {
                    setModelError(false);
                    setModelLoaded(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/10"
                >
                  {t('tpl.menu.retry')}
                </button>
              </div>
            )}

            {!modelLoaded && !modelError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/80 backdrop-blur-sm pointer-events-none">
                <div
                  className="w-12 h-12 border-[3px] border-t-transparent rounded-full animate-spin shadow-lg"
                  style={{ borderColor: `${brandColor} transparent transparent transparent` }}
                />
                <p className="text-zinc-300 font-bold tracking-widest uppercase text-xs">{t('tpl.menu.loadingModel')}</p>
              </div>
            )}

            {showHints && modelLoaded && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                {[
                  { icon: '↺', text: t('tpl.menu.hintDragRotate') },
                  { icon: '⊕', text: t('tpl.menu.hintPinchZoom') },
                  { icon: '📱', text: t('tpl.menu.hintTapAR') },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-xs font-bold text-white bg-zinc-900/80 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 shadow-2xl animate-pulse"
                  >
                    <span className="opacity-60">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Nav arrows */}
            <button
              onClick={() => onNavigate(-1)}
              disabled={currentIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur-2xl border border-white/10 text-white transition-all disabled:opacity-0 disabled:-translate-x-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-2xl"
              aria-label={t('tpl.menu.previousItem')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate(1)}
              disabled={currentIndex === items.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur-2xl border border-white/10 text-white transition-all disabled:opacity-0 disabled:translate-x-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-2xl"
              aria-label={t('tpl.menu.nextItem')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Controls row — pinned at bottom of viewer */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              <div className="flex gap-1.5 p-1.5 bg-zinc-900/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shrink-0">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label={t('tpl.menu.resetCamera')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('tpl.menu.reset')}</span>
                </button>
                <div className="w-px bg-white/10 my-1.5" />
                <button
                  onClick={() => setLighting((l) => (l === 'studio' ? 'natural' : 'studio'))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label="Toggle lighting"
                >
                  <span className="hidden sm:inline">
                    {lighting === 'studio'
                      ? `☀ ${t('tpl.menu.naturalLight')}`
                      : `💡 ${t('tpl.menu.studioLight')}`}
                  </span>
                  <span className="sm:hidden">{t('tpl.menu.light')}</span>
                </button>
              </div>

              <button
                onClick={handleAR}
                className="flex shrink-0 items-center gap-1.5 px-5 py-3 rounded-2xl text-white text-xs font-black tracking-widest uppercase transition-all hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950 shadow-2xl group/ar"
                style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px -6px ${brandColor}80` }}
                aria-label="View in AR"
              >
                <Smartphone className="w-4 h-4 group-hover/ar:rotate-12 transition-transform" />
                {t('tpl.menu.ar')}
              </button>
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-3 right-3 z-10 hidden xl:flex items-center gap-2 text-stone-600 text-[10px] font-mono">
              <kbd className="px-1.5 py-0.5 border border-stone-800 rounded">ESC</kbd> close
              <kbd className="px-1.5 py-0.5 border border-stone-800 rounded">← →</kbd> navigate
            </div>
          </div>
        </div>

        {/* ── Middle: Management Panel (edit, share, qr) ── */}
        {activePanel !== null && (
          <div className={`flex-shrink-0 bg-zinc-950 lg:border-l border-t lg:border-t-0 border-white/5 overflow-y-auto lg:h-[calc(100dvh-57px)] transition-all ${panelMinimized ? 'lg:w-12' : 'lg:w-[360px]'}`}>
            <div className="flex flex-col h-full">
              {/* Tab strip header */}
              <div className={`flex items-center gap-2 border-b border-white/5 ${panelMinimized ? 'flex-col px-1.5 pt-3 pb-2' : 'px-4 pt-4 pb-3'}`}>
                <div className={`flex ${panelMinimized ? 'flex-col gap-1.5' : 'gap-1'}`}>
                  <button
                    onClick={() => setPanelMinimized(!panelMinimized)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label={panelMinimized ? 'Expand panel' : 'Minimize panel'}
                  >
                    {panelMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setActivePanel(null); setPanelMinimized(false); }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {!panelMinimized && (
                  <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
                    {MODAL_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activePanel === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActivePanel(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive ? '' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                          style={
                            isActive ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}
                          }
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {panelMinimized && (
                  <div className="flex flex-col gap-1">
                    {MODAL_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activePanel === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setActivePanel(tab.id); setPanelMinimized(false); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={
                            isActive ? { backgroundColor: `${brandColor}15`, color: brandColor } : {}
                          }
                          title={tab.label}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? '' : 'text-zinc-500 hover:text-zinc-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Panel body */}
              <div className={`flex-1 overflow-y-auto ${panelMinimized ? 'hidden' : 'p-5'}`}>
                {/* ── QR Code ── */}
                {activePanel === 'qr' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        {t('tpl.menu.qrCode', 'QR Code')}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {t('tpl.menu.qrDesc', 'Scannable QR code linking directly to this item.')}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-4 py-4">
                      <QRCodeDisplay
                        url={itemUrl}
                        size="md"
                        label={item.name}
                      />
                      <code className="text-[10px] text-zinc-500 font-mono max-w-full truncate px-4 py-2 bg-zinc-800/60 rounded-xl border border-zinc-700/30">
                        {itemUrl}
                      </code>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 transition-colors"
                        >
                          {copied === 'link' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copied === 'link'
                            ? t('tpl.menu.copied', 'Copied!')
                            : t('tpl.menu.copyLink', 'Copy Link')}
                        </button>
                        <a
                          href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(itemUrl)}&format=png`}
                          download={`${item.name.replace(/\s+/g, '_')}_QR.png`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white hover:brightness-110 transition-all"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t('tpl.menu.downloadQR', 'Download')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Edit Details ── */}
                {activePanel === 'edit' && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5">
                        {t('tpl.menu.editDetails', 'Edit Details')}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {t('tpl.menu.editDesc', 'Modify all product information line by line.')}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          {t('tpl.menu.itemName', 'Item Name')}
                        </label>
                        <input
                          type="text"
                          value={draftItem.name}
                          onChange={(e) => setDraftItem((prev) => ({ ...prev, name: e.target.value }))}
                          className={INPUT_CLASS}
                          style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                          placeholder="e.g., Wagyu Burger"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            {t('tpl.menu.category', 'Category')}
                          </label>
                          <select
                            value={draftItem.category}
                            onChange={(e) => setDraftItem((prev) => ({ ...prev, category: e.target.value }))}
                            className={INPUT_CLASS}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            {t('tpl.menu.price', 'Price')}
                          </label>
                          <input
                            type="text"
                            value={draftItem.price}
                            onChange={(e) => setDraftItem((prev) => ({ ...prev, price: e.target.value }))}
                            className={INPUT_CLASS}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                            placeholder="e.g., $24"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          {t('tpl.menu.description', 'Description')}
                        </label>
                        <textarea
                          value={draftItem.desc}
                          onChange={(e) => setDraftItem((prev) => ({ ...prev, desc: e.target.value }))}
                          rows={2}
                          className={`${INPUT_CLASS} resize-none`}
                          style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                          placeholder="Detailed description of the item..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            {t('tpl.menu.calories', 'Calories')}
                          </label>
                          <input
                            type="text"
                            value={draftItem.calories}
                            onChange={(e) => setDraftItem((prev) => ({ ...prev, calories: e.target.value }))}
                            className={INPUT_CLASS}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                            placeholder="e.g., 650"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            {t('tpl.menu.imageUrl', 'Image URL')}
                          </label>
                          <input
                            type="text"
                            value={draftItem.image}
                            onChange={(e) => setDraftItem((prev) => ({ ...prev, image: e.target.value }))}
                            className={`${INPUT_CLASS} font-mono`}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            {t('tpl.menu.tags', 'Tags')}{' '}
                            <span className="text-zinc-600">(comma)</span>
                          </label>
                          <input
                            type="text"
                            value={draftItem.tags}
                            onChange={(e) => setDraftItem((prev) => ({ ...prev, tags: e.target.value }))}
                            className={INPUT_CLASS}
                            style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                            placeholder="e.g., RAW, CHEF'S PICK"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">
                            {t('tpl.menu.allergens', 'Allergens')}
                          </label>
                          <div ref={allergenDropdownRef} className="relative">
                            <button
                              type="button"
                              onClick={() => setAllergenDropdownOpen((v) => !v)}
                              className={`${INPUT_CLASS} flex items-center justify-between gap-1 text-left w-full`}
                              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                            >
                              <span className={draftItem.allergens ? 'text-white truncate text-[11px]' : 'text-zinc-500 truncate'}>
                                {draftItem.allergens
                                  ? `${draftItem.allergens.split(',').filter(Boolean).length} selected`
                                  : 'Select...'}
                              </span>
                              <ChevronDown className={`w-3 h-3 text-zinc-500 flex-shrink-0 transition-transform ${allergenDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {allergenDropdownOpen && (
                              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700/60 rounded-lg shadow-xl shadow-black/40 max-h-48 overflow-y-auto scrollbar-none">
                                {COMMON_ALLERGENS.map((allergen) => {
                                  const selected = draftItem.allergens.split(',').map((s) => s.trim()).includes(allergen);
                                  return (
                                    <button
                                      key={allergen}
                                      type="button"
                                      onClick={() => {
                                        const current = draftItem.allergens.split(',').map((s) => s.trim()).filter(Boolean);
                                        const updated = selected ? current.filter((a) => a !== allergen) : [...current, allergen];
                                        setDraftItem((prev) => ({ ...prev, allergens: updated.join(', ') }));
                                      }}
                                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] transition-colors ${selected ? 'text-red-400 bg-red-500/5' : 'text-zinc-300 hover:bg-zinc-800/80'
                                        }`}
                                    >
                                      <span className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-red-500/20 border-red-500/40' : 'border-zinc-600 bg-zinc-800/60'
                                        }`}>
                                        {selected && <Check className="w-2 h-2" />}
                                      </span>
                                      {allergen}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Selected allergen pills */}
                      {draftItem.allergens && (
                        <div className="flex flex-wrap gap-1">
                          {draftItem.allergens.split(',').map((a) => a.trim()).filter(Boolean).map((allergen) => (
                            <span
                              key={allergen}
                              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium"
                            >
                              {allergen}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = draftItem.allergens.split(',').map((s) => s.trim()).filter((s) => s && s !== allergen).join(', ');
                                  setDraftItem((prev) => ({ ...prev, allergens: updated }));
                                }}
                                className="hover:text-red-300 transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          {t('tpl.menu.pairsWell', 'Pairs Well With')}
                        </label>
                        {(() => {
                          const selectedNames = draftItem.pairsWell.split(',').map((s) => s.trim()).filter(Boolean);
                          const otherItems = allItems.filter((i) => i.id !== item.id);
                          const toggleItem = (name: string) => {
                            const current = draftItem.pairsWell.split(',').map((s) => s.trim()).filter(Boolean);
                            const next = current.includes(name)
                              ? current.filter((n) => n !== name)
                              : [...current, name];
                            setDraftItem((prev) => ({ ...prev, pairsWell: next.join(', ') }));
                          };
                          return (
                            <details className="group">
                              <summary
                                className={`${INPUT_CLASS} cursor-pointer list-none flex items-center justify-between`}
                                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                              >
                                <span className={`truncate ${selectedNames.length === 0 ? 'text-zinc-500' : 'text-white'}`}>
                                  {selectedNames.length === 0
                                    ? 'Select dishes...'
                                    : `${selectedNames.length} selected`}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-1 max-h-[160px] overflow-y-auto rounded-lg border border-zinc-700/40 bg-zinc-800/80 scrollbar-thin">
                                {otherItems.map((other) => {
                                  const isChecked = selectedNames.some((n) => n.toLowerCase() === other.name.toLowerCase());
                                  return (
                                    <button
                                      key={other.id}
                                      type="button"
                                      onClick={() => toggleItem(other.name)}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors"
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isChecked
                                          ? 'border-transparent'
                                          : 'border-zinc-600 bg-zinc-700/50'
                                          }`}
                                        style={isChecked ? { backgroundColor: brandColor } : undefined}
                                      >
                                        {isChecked && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                      <span className={`truncate ${isChecked ? 'text-white font-medium' : 'text-zinc-400'}`}>
                                        {other.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </details>
                          );
                        })()}
                      </div>

                      {/* Marketplace */}
                      <div className="pt-2 mt-0.5 border-t border-zinc-800/40">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-zinc-400">
                            {t('tpl.menu.marketplace', 'List on Model Library')}
                          </label>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={draftItem.marketplace_listed ?? false}
                            onClick={() => setDraftItem((prev) => ({ ...prev, marketplace_listed: !prev.marketplace_listed }))}
                            className={`relative w-10 h-5 rounded-full transition-colors ${draftItem.marketplace_listed ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${draftItem.marketplace_listed ? 'translate-x-5' : ''}`} />
                          </button>
                        </div>
                        {draftItem.marketplace_listed && (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-zinc-400 mb-1">
                                {t('tpl.menu.marketplacePrice', 'Sale Price (EUR)')}
                              </label>
                              <input
                                type="text"
                                value={draftItem.marketplace_price ?? ''}
                                onChange={(e) => setDraftItem((prev) => ({ ...prev, marketplace_price: e.target.value }))}
                                className={INPUT_CLASS}
                                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                                placeholder="e.g., 149"
                              />
                            </div>
                            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {t('tpl.menu.marketplaceSplit', 'You earn 50% of every sale')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Save action */}
                      <div className="pt-3 pb-1 border-t border-zinc-800/40 mt-1">
                        <p className="text-xs text-zinc-500 flex items-center gap-2 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {t('tpl.menu.unsavedChanges', 'You have unsaved changes')}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActivePanel(null)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                          >
                            {t('tpl.menu.cancel', 'Cancel')}
                          </button>
                          <button
                            onClick={handleSaveEdits}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-lg"
                            style={{ backgroundColor: brandColor, boxShadow: `0 8px 20px -4px ${brandColor}40` }}
                          >
                            <Check className="w-4 h-4" />
                            {t('tpl.menu.saveChanges', 'Save Changes')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ── Right: Item Details (live preview from draftItem when editing) ── */}
        <div className="lg:w-[360px] xl:w-[400px] flex-shrink-0 bg-zinc-950 lg:border-l border-t lg:border-t-0 border-white/5 overflow-y-auto lg:h-[calc(100dvh-57px)]">
          <DishCardContent
            name={displayItem.name}
            price={showPrices ? displayItem.price.replace('$', currency) : null}
            desc={displayItem.desc}
            tags={displayItem.tags}
            calories={displayItem.calories}
            spiceLevel={displayItem.spiceLevel}
            allergens={displayItem.allergens}
            pairsWell={displayItem.pairsWell.map((p) => {
              const matched = allItems.find((i) => i.id === p);
              return matched ? matched.name : p;
            })}
            fieldVisibility={fieldVisibility}
            brandColor={brandColor}
            className="px-5 pt-5 pb-0"
          >
            {/* Related items thumbnails */}
            {fieldVisibility.pairsWell && relatedItems.length > 0 && (
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  {t('tpl.menu.pairsWellWith')}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {relatedItems.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectItem(rel)}
                      className="flex-shrink-0 flex flex-col gap-1.5 w-20 group/rel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl snap-start text-left"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/5 bg-zinc-900 shadow-lg relative">
                        <img
                          src={rel.image}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 group-hover/rel:text-white transition-colors line-clamp-2 leading-tight">
                        {rel.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-3 pb-5 mt-3 border-t border-white/5 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAR}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-brand-500/20 group/btn"
                  style={{ backgroundColor: brandColor }}
                >
                  <Smartphone className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                  {t('tpl.menu.ar')}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-zinc-300 bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Share2 className="w-4 h-4" />
                  {t('tpl.menu.share')}
                </button>
              </div>

              {isEditMode && (
                <OverlayMoreMenu
                  item={item}
                  brandColor={brandColor}
                  onSetActivePanel={setActivePanel}
                  onDuplicate={onDuplicate}
                  onToggleHidden={onToggleHidden}
                  onDelete={() => { onDelete?.(); onClose(); }}
                />
              )}
            </div>
          </DishCardContent>
        </div>
      </div>
    </div>
  );
};


// ─── HowARPopup ──────────────────────────────────────────────────────────────

interface HowARPopupProps {
  open: boolean;
  onClose: () => void;
  brandColor: string;
}

const HowARPopup: React.FC<HowARPopupProps> = ({ open, onClose, brandColor }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z.detailsBackdrop }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('tpl.menu.howARWorks')}
        style={{ zIndex: Z.detailsSheet }}
        className="relative w-[min(400px,calc(100vw-32px))] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4.5 h-4.5 text-white" style={{ color: brandColor }} />
            <h2 className="text-base font-bold text-white tracking-tight">{t('tpl.menu.howARTitle')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-4">
          {[
            {
              step: '1',
              title: t('tpl.menu.howARStep1Title'),
              desc: t('tpl.menu.howARStep1Desc'),
            },
            {
              step: '2',
              title: t('tpl.menu.howARStep2Title'),
              desc: t('tpl.menu.howARStep2Desc'),
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3.5 items-start">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                {step}
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: brandColor }}
          >
            {t('tpl.menu.gotIt', 'Got it')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── RestaurantMenu (main) ────────────────────────────────────────────────────

/* CustomizationPanel imported from @/components/common/CustomizationPanel */


const RestaurantMenu: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToast();
  const { user } = useAuth();
  const orgId = user?.orgId ?? 'org-001';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Load persisted per-customer state from localStorage
  const savedMenu = useMemo(() => id ? loadMenuFromStorage(orgId, id) : null, [orgId, id]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => savedMenu?.menuItems ?? INITIAL_ITEMS);

  const isEditMode = location.pathname.endsWith('/edit');
  const isOwner = isEditMode;
  const [isSaving, setIsSaving] = useState(false);

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [viewerItem, setViewerItem] = useState<MenuItem | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters] = useState<string[]>([]);
  const [showHowAR, setShowHowAR] = useState(false);
  const [pendingPanel, setPendingPanel] = useState<{ itemId: string; panel: ModalPanel } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [menuSettings, setMenuSettings] = useState<MenuSettings>(() => savedMenu?.menuSettings ?? {
    title: 'Restaurant Menu',
    brandColor: '#d97706',
    font: 'serif',
    showPrices: true,
    currency: '$',
    fieldVisibility: { ...DEFAULT_FIELD_VISIBILITY },
    hours: RESTAURANT_INFO.hours,
    enableTimeBasedMenu: false,
    breakfastEndTime: '11:00',
    lunchEndTime: '16:00',
    lunchMenuId: '',
    dinnerMenuId: '',
    themePreset: 'amber',
    customBrandColor: '',
  });

  const [customization, setCustomization] = useState<CustomizationState>(() => savedMenu?.customization ?? { ...DEFAULT_CUSTOMIZATION });
  const [isCustomizePanelOpen, setIsCustomizePanelOpen] = useState(false);
  const handleCustomizationChange = useCallback((patch: Partial<CustomizationState>) => {
    setCustomization((prev) => {
      const next = { ...prev, ...patch };
      // When picking a custom color, use it directly
      if (patch.customBrandColor) {
        setMenuSettings((ms) => ({ ...ms, brandColor: patch.customBrandColor ?? ms.brandColor }));
      }
      // When changing theme preset, clear custom color and use preset color
      else if (patch.themePreset) {
        next.customBrandColor = '';
        const preset = THEME_PRESETS.find((t) => t.id === patch.themePreset);
        if (preset) {
          setMenuSettings((ms) => ({ ...ms, brandColor: preset.brandColor }));
        }
      }
      return next;
    });
  }, []);

  const activeTheme = (() => {
    const base = THEME_PRESETS.find((t) => t.id === menuSettings.themePreset) ?? THEME_PRESETS[0];
    if (menuSettings.customBrandColor) {
      // Derive bg/surface/accent from the custom color
      const rgb = hexToRgb(menuSettings.customBrandColor);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const h = Math.round(hsl.h);
      const s = Math.round(hsl.s * 100);
      return {
        ...base,
        brandColor: menuSettings.customBrandColor,
        bg: `hsl(${h}, ${Math.min(s, 30)}%, 4%)`,
        surface: `hsl(${h}, ${Math.min(s, 25)}%, 10%)`,
        accent: menuSettings.customBrandColor,
      };
    }
    return base;
  })();
  const customizeChangedCount = (Object.keys(DEFAULT_CUSTOMIZATION) as Array<keyof CustomizationState>).filter(
    (k) => customization[k] !== DEFAULT_CUSTOMIZATION[k]
  ).length;

  // Layout presets (persisted to localStorage per org+project)
  const {
    presets: savedPresets,
    activePresetId,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
  } = useLayoutPresets(orgId, id);

  // Auto-save all customer state to localStorage on every change
  const menuStateRef = useRef({ menuItems, menuSettings, customization });
  menuStateRef.current = { menuItems, menuSettings, customization };
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      saveMenuToStorage(orgId, id, menuStateRef.current);
    }, 500); // debounce 500ms
    return () => clearTimeout(timer);
  }, [menuItems, menuSettings, customization, orgId, id]);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const sectionRefCbs = useRef<Record<string, (el: HTMLElement | null) => void>>({});
  const headerRef = useRef<HTMLElement>(null);
  const { scrollToId, isNativeSupported } = useScrollOffset(headerRef);
  const headerHeight = useHeaderHeight(headerRef);
  const getSectionRef = useCallback((catId: string) => {
    if (!sectionRefCbs.current[catId]) {
      sectionRefCbs.current[catId] = (el: HTMLElement | null) => {
        sectionRefs.current[catId] = el;
      };
    }
    return sectionRefCbs.current[catId];
  }, []);
  const modelViewerImported = useRef(false);
  const arViewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load project metadata
        const projects = (await ProjectsProvider.list()) as unknown as Project[];
        const found = projects.find((p) => p.id === id);
        if (found) setProject(found);

        // Skip API menu loading if we already have localStorage data (customer-specific)
        const hasLocalData = id ? Boolean(loadMenuFromStorage(orgId, id)) : false;
        if (!hasLocalData && id) {
          const config = await MenusProvider.get(id);
          if (config) {
            setMenuItems(config.items.map(fromDTO));
            setMenuSettings({
              title: config.title,
              brandColor: config.brand_color,
              font: config.font,
              showPrices: config.show_prices,
              currency: config.currency,
              fieldVisibility: config.field_visibility as unknown as FieldVisibility,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hours may not exist in older DTOs
              hours: ((config as any).hours as string) ?? '',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              enableTimeBasedMenu: ((config as any).enableTimeBasedMenu as boolean) ?? false,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              breakfastEndTime: ((config as any).breakfastEndTime as string) ?? '11:00',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              lunchEndTime: ((config as any).lunchEndTime as string) ?? '16:00',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              lunchMenuId: ((config as any).lunchMenuId as string) ?? '',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              dinnerMenuId: ((config as any).dinnerMenuId as string) ?? '',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              themePreset: ((config as any).theme_preset as string) ?? 'amber',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              customBrandColor: ((config as any).custom_brand_color as string) ?? '',
            });
          } else if (found) {
            // No saved config yet — use defaults but set title from project
            setMenuSettings((prev) => ({ ...prev, title: found.name }));
          }
        }
      } catch {
        if (import.meta.env.DEV) console.error('Failed to load project/menu data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, orgId]);

  // Show scroll-to-top button after scrolling past hero
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Auto-load active preset on mount (once, after data fetch)
  const presetLoadedRef = useRef(false);
  useEffect(() => {
    if (!loading && activePresetId && !presetLoadedRef.current) {
      presetLoadedRef.current = true;
      const found = savedPresets.find((p) => p.id === activePresetId);
      if (found) {
        setCustomization(found.state);
        const theme = THEME_PRESETS.find((tp) => tp.id === found.state.themePreset);
        if (theme) setMenuSettings((ms) => ({ ...ms, brandColor: theme.brandColor }));
      }
    }
  }, [loading, activePresetId, savedPresets]);

  // Intersection observer → active category
  useEffect(() => {
    if (loading) return;
    const top = -(headerHeight + 12);
    const bottom = -(headerHeight + 80);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const catId = entry.target.id.replace('cat-', '');
            setActiveCategory(catId);
          }
        });
      },
      { rootMargin: `${top}px 0px ${bottom}px 0px`, threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [loading, headerHeight]);

  // Load model-viewer lazily — import when any items have 3D models (not just when overlay opens)
  useEffect(() => {
    if (modelViewerImported.current) return;
    const hasAny3D = menuItems.some((i) => Boolean(i.modelUrl));
    if (hasAny3D && !loading) {
      modelViewerImported.current = true;
      import('@google/model-viewer');
    }
  }, [menuItems, loading]);

  const handleToggleFieldVisibility = useCallback((field: keyof FieldVisibility) => {
    setMenuSettings((prev) => ({
      ...prev,
      fieldVisibility: {
        ...prev.fieldVisibility,
        [field]: !prev.fieldVisibility[field],
      },
    }));
  }, []);

  const handleUpdateItem = (
    itemId: string,
    field: keyof MenuItem,
    value: MenuItem[keyof MenuItem]
  ) => {
    setMenuItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)));
  };

  const handleDeleteItem = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    if (item)
      success(
        t('tpl.menu.itemDeleted', { name: item.name, defaultValue: `"${item.name}" removed` })
      );
  };

  const handleDuplicateItem = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    const copyId = `${item.id}-copy-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    const copy: MenuItem = {
      ...item,
      id: copyId,
      name: `${item.name} (copy)`,
    };
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    success(
      t('tpl.menu.itemDuplicated', { name: item.name, defaultValue: `"${item.name}" duplicated` })
    );
    // Scroll the new card into view after React renders
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-item-id="${copyId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleAddFromLibrary = (libraryItem: MenuItem) => {
    const newItem: MenuItem = {
      ...libraryItem,
      id: `lib-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
    setActiveCategory(newItem.category);
    success(`"${newItem.name}" added to menu`);
  };

  const handleToggleHidden = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, hidden: !(i.hidden ?? false) } : i))
    );
  };

  const handleReviewItem = (itemId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const item = menuItems.find((i) => i.id === itemId);
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, reviewStatus: newStatus } : i))
    );
    if (item) {
      success(
        t('tpl.menu.reviewUpdated', {
          name: item.name,
          status: newStatus,
          defaultValue: `"${item.name}" marked as ${newStatus}`,
        })
      );
    }
  };

  const handleDownloadItem = (itemId: string, type: 'image' | 'model') => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    const url = type === 'model' ? item.modelUrl : item.image;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name.replace(/\s+/g, '_')}.${type === 'model' ? 'glb' : 'jpg'}`;
    a.click();
    success(
      t('tpl.menu.downloadStarted', {
        name: item.name,
        defaultValue: `Downloading "${item.name}"…`,
      })
    );
  };

  const handleReorderItem = (fromId: string, toId: string) => {
    setMenuItems((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((i) => i.id === fromId);
      const toIdx = next.findIndex((i) => i.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  /** Export menu items to CSV — not yet wired to UI */
  const _handleExportToCsv = () => {
    // Convert menu items to CSV format
    const headers = [
      'Name',
      'Category',
      'Description',
      'Price',
      'Calories',
      'Tags',
      'Allergens',
      'Pairs Well',
      'Hidden',
      'Review Status',
      'View Count',
      'AR Launches',
    ];

    // Sanitize values to prevent CSV formula injection (=, +, -, @, \t, \r)
    const sanitize = (v: string) => {
      const s = v.replace(/"/g, '""');
      return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    };

    const csvRows = [
      headers.join(','),
      ...menuItems.map((item) => {
        const row = [
          `"${sanitize(item.name)}"`,
          `"${sanitize(item.category)}"`,
          `"${sanitize(item.desc)}"`,
          `"${sanitize(item.price)}"`,
          `"${sanitize(item.calories)}"`,
          `"${sanitize(item.tags.join('; '))}"`,
          `"${sanitize(item.allergens.join('; '))}"`,
          `"${sanitize(item.pairsWell.join('; '))}"`,
          item.hidden ? 'Yes' : 'No',
          item.reviewStatus || 'N/A',
          item.viewCount || 0,
          item.arLaunches || 0,
        ];
        return row.join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${menuSettings.title.replace(/\s+/g, '_')}_menu_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
    success(t('tpl.menu.exportSuccess', { defaultValue: 'Menu exported successfully!' }));
  };

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      // Save to API (Supabase when enabled)
      await MenusProvider.save(id, {
        title: menuSettings.title,
        brand_color: menuSettings.brandColor,
        font: menuSettings.font,
        show_prices: menuSettings.showPrices,
        currency: menuSettings.currency,
        enableTimeBasedMenu: menuSettings.enableTimeBasedMenu,
        breakfastEndTime: menuSettings.breakfastEndTime,
        lunchEndTime: menuSettings.lunchEndTime,
        lunchMenuId: menuSettings.lunchMenuId,
        dinnerMenuId: menuSettings.dinnerMenuId,
        theme_preset: menuSettings.themePreset,
        custom_brand_color: menuSettings.customBrandColor,
        field_visibility: menuSettings.fieldVisibility as unknown as Record<string, boolean>,
        categories: CATEGORIES,
        items: menuItems.map(toDTO),
      });
      // Also persist full state to localStorage
      saveMenuToStorage(orgId, id, { menuItems, menuSettings, customization });
      success(t('tpl.menu.saveSuccess', { defaultValue: 'Changes saved!' }));
    } catch {
      showError(t('tpl.menu.saveError', { defaultValue: 'Failed to save changes. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isNativeSupported) {
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    } else {
      scrollToId(`cat-${catId}`);
    }
  };

  const openViewer = (item: MenuItem) => {
    setSelectedItem(null);
    setViewerItem(item);
  };

  const launchAR = useCallback((item: MenuItem) => {
    if (!item.modelUrl) return;
    const viewer = arViewerRef.current as (HTMLElement & { activateAR?: () => void; canActivateAR?: boolean }) | null;
    if (!viewer) {
      // Fallback to 3D viewer overlay if hidden viewer not ready
      openViewer(item);
      return;
    }
    // Set the model source to the item's model
    viewer.setAttribute('src', item.modelUrl);
    // Wait briefly for the model to register, then attempt AR
    const tryActivateAR = () => {
      if (viewer.canActivateAR) {
        viewer.activateAR?.();
      } else {
        // AR not available — fall back to the 3D viewer overlay
        openViewer(item);
      }
    };
    // Give model-viewer a moment to process the new src and check AR availability
    setTimeout(tryActivateAR, 300);
  }, []);

  const navigateViewer = useCallback(
    (dir: 1 | -1) => {
      if (!viewerItem) return;
      const idx = menuItems.findIndex((i) => i.id === viewerItem.id);
      const next = idx + dir;
      if (next >= 0 && next < menuItems.length) setViewerItem(menuItems[next]);
    },
    [viewerItem, menuItems]
  );

  const overrideMenu = new URLSearchParams(location.search).get('override');

  // Time-based smart redirection logic
  useEffect(() => {
    if (isEditMode || !menuSettings.enableTimeBasedMenu) return;
    if (overrideMenu) return; // Wait until overriden is disabled

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const [bHour, bMin] = (menuSettings.breakfastEndTime || '11:00').split(':').map(Number);
    const [lHour, lMin] = (menuSettings.lunchEndTime || '16:00').split(':').map(Number);

    const isBreakfastTime = currentHour < bHour || (currentHour === bHour && currentMinutes < bMin);
    const isLunchTime = !isBreakfastTime && (currentHour < lHour || (currentHour === lHour && currentMinutes < lMin));

    // Redirect to configured menus if the target is NOT the current page
    if (isLunchTime && menuSettings.lunchMenuId && menuSettings.lunchMenuId !== id) {
      navigate(`/project/${menuSettings.lunchMenuId}/menu`);
    } else if (!isBreakfastTime && !isLunchTime && menuSettings.dinnerMenuId && menuSettings.dinnerMenuId !== id) {
      navigate(`/project/${menuSettings.dinnerMenuId}/menu`);
    }
  }, [
    isEditMode,
    menuSettings.enableTimeBasedMenu,
    menuSettings.breakfastEndTime,
    menuSettings.lunchEndTime,
    menuSettings.lunchMenuId,
    menuSettings.dinnerMenuId,
    id,
    navigate,
    overrideMenu,
    location.search
  ]);

  const filteredItems = useMemo(
    () =>
      menuItems.filter((i) => {
        // In public view, hide items marked as hidden
        if (!isEditMode && i.hidden) return false;

        if (activeFilters.length > 0 && !activeFilters.some((f) => i.tags.includes(f))) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            i.name.toLowerCase().includes(q) ||
            i.desc.toLowerCase().includes(q) ||
            i.tags.some((tag) => tag.toLowerCase().includes(q))
          );
        }
        return true;
      }),
    [menuItems, isEditMode, activeFilters, searchQuery]
  );

  const brand = menuSettings.brandColor;

  // CSS tokens
  const fontWeightMap: Record<FontWeight, string> = {
    light: '300',
    default: '400',
    bold: '700',
  };

  const cssVars = {
    '--brand': brand,
    '--bg': activeTheme.bg,
    '--surface': activeTheme.surface,
    '--text': '#fafafa',
    '--muted': '#71717a',
    '--border': '#27272a',
    '--radius': '16px',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: fontWeightMap[customization.fontWeight],
  } as React.CSSProperties;

  if (loading) {
    return (
      <div
        className="min-h-screen bg-zinc-950 text-white"
        aria-busy="true"
        aria-label="Loading menu"
      >
        <div className="h-14 bg-zinc-900 border-b border-white/5 animate-pulse" />
        <div className="h-64 bg-zinc-900 animate-pulse" />
        <div className="h-11 bg-zinc-900/80 border-b border-white/5 animate-pulse" />
        <div className="px-4 py-6 space-y-3 max-w-2xl mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-zinc-950 min-h-screen text-amber-50 flex flex-col items-center justify-center gap-4">
        <ChefHat className="w-16 h-16 text-zinc-700/50" />
        <p className="text-zinc-400 font-medium">{t('tpl.menu.menuNotFound')}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-amber-500 hover:text-amber-400 font-bold tracking-wide transition-colors"
        >
          {t('tpl.menu.backToDashboard')}
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-zinc-100 selection:text-white selection:bg-brand-500/30 w-full transition-colors duration-500"
      style={{ ...cssVars, backgroundColor: activeTheme.bg }}
      {...(import.meta.env.DEV && {
        'data-component': 'RestaurantMenu',
        'data-file': 'src/pages/templates/RestaurantMenu.tsx',
      })}
    >
      {isSettingsOpen && (
        <React.Suspense fallback={null}>
          <MenuSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentSettings={menuSettings}
            onSave={(s) => {
              setMenuSettings((prev) => ({ ...prev, ...s }));
              if (project) setProject({ ...project, name: s.title });
            }}
          />
        </React.Suspense>
      )}

      <>
        {/* Owner preview badge */}
        {isOwner && (
          <div className="fixed z-30 top-16 left-1/2 -translate-x-1/2 mt-1 pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-900/50 text-amber-400 border border-amber-800/40 backdrop-blur-sm">
              {t('tpl.menu.ownerPreview')}
            </span>
          </div>
        )}

        <MenuHeader
          title={menuSettings.title}
          brandColor={brand}
          isEditMode={isEditMode}
          isOwner={isOwner}
          isSaving={isSaving}
          onSettings={() => setIsSettingsOpen(true)}
          onSave={handleSave}
          headerRef={headerRef}
        />

        <MenuHero
          title={menuSettings.title}
          brandColor={brand}
          hours={menuSettings.hours}
          onHoursChange={(h) => setMenuSettings((ms) => ({ ...ms, hours: h }))}
          onViewSignature={() => {
            const first = menuItems.find((i) => i.modelUrl);
            if (first) openViewer(first);
          }}
          onHowAR={() => setShowHowAR(true)}
          heroSize={customization.heroSize}
          heroImage={customization.heroImage}
          onHeroImageChange={(url) => setCustomization((prev) => ({ ...prev, heroImage: url }))}
          isEditMode={isEditMode}
          onCustomize={isEditMode ? () => setIsCustomizePanelOpen(true) : undefined}
          customizeChangedCount={customizeChangedCount}
          presets={savedPresets}
          activePresetId={activePresetId}
          onLoadPreset={(presetId) => {
            const loaded = loadPreset(presetId);
            if (loaded) {
              setCustomization(loaded);
              if (loaded.customBrandColor) {
                setMenuSettings((ms) => ({ ...ms, brandColor: loaded.customBrandColor }));
              } else {
                const theme = THEME_PRESETS.find((tp) => tp.id === loaded.themePreset);
                if (theme) setMenuSettings((ms) => ({ ...ms, brandColor: theme.brandColor }));
              }
            }
          }}
        />

        <CategoryTabs
          categories={CATEGORIES}
          items={filteredItems}
          active={activeCategory}
          onSelect={handleCategorySelect}
          onSearchToggle={() => {
            setShowSearch((v) => !v);
            setSearchQuery('');
          }}
          brandColor={brand}
          isEditMode={isEditMode}
          onAddFromLibrary={handleAddFromLibrary}
        />

        {/* Search bar */}
        {showSearch && (
          <div
            className="sticky z-30 backdrop-blur-2xl border-b border-white/5 px-4 py-3 shadow-xl transition-colors duration-500"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg, #09090b) 80%, transparent)', top: '96px' }}
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                autoFocus
                type="search"
                placeholder={t('tpl.menu.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-12 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all shadow-inner font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors bg-zinc-800 rounded-full"
                  aria-label={t('tpl.menu.clearSearch')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <main
          className={`px-4 md:px-8 max-w-7xl mx-auto transition-all duration-500 ${customization.spacing === 'compact'
            ? 'py-8 md:py-12 space-y-10 md:space-y-16'
            : customization.spacing === 'spacious'
              ? 'py-16 md:py-28 space-y-24 md:space-y-36'
              : 'py-12 md:py-20 space-y-16 md:space-y-24'
            }`}
          id="menu-content"
        >
          {searchQuery.trim() ? (
            <section aria-label="Search results">
              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-6 h-6 text-zinc-500" />
                  <p className="text-base text-zinc-400 font-medium">
                    {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &ldquo;
                    <span className="text-white font-bold tracking-tight">{searchQuery}</span>&rdquo;
                  </p>
                </div>
              </div>
              <StaggerContainer
                viewport={false}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
              >
                {filteredItems.map((item) => (
                  <StaggerItem key={item.id}>
                    <MenuItemCard
                      item={item}
                      allItems={menuItems}
                      brandColor={brand}
                      showPrices={menuSettings.showPrices}
                      currency={menuSettings.currency}
                      fieldVisibility={menuSettings.fieldVisibility}
                      onToggleFieldVisibility={handleToggleFieldVisibility}
                      isEditMode={isEditMode}
                      onDetails={() => setSelectedItem(item)}
                      onView3D={() => openViewer(item)}
                      onLaunchAR={() => launchAR(item)}
                      onUpdate={(field, value) => handleUpdateItem(item.id, field, value)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onDuplicate={() => handleDuplicateItem(item.id)}
                      onToggleHidden={() => handleToggleHidden(item.id)}
                      onReview={(action) => handleReviewItem(item.id, action)}
                      onDownload={(type) => handleDownloadItem(item.id, type)}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          ) : (
            CATEGORIES.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat.id);
              if (catItems.length === 0) return null;
              return (
                <MenuSection
                  key={cat.id}
                  category={cat}
                  items={catItems}
                  allItems={menuItems}
                  brandColor={brand}
                  showPrices={menuSettings.showPrices}
                  currency={menuSettings.currency}
                  fieldVisibility={menuSettings.fieldVisibility}
                  onToggleFieldVisibility={handleToggleFieldVisibility}
                  isEditMode={isEditMode}
                  sectionRef={getSectionRef(cat.id)}
                  onDetails={(item) => setSelectedItem(item)}
                  onView3D={(item) => openViewer(item)}
                  onLaunchAR={(item) => launchAR(item)}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onDuplicate={handleDuplicateItem}
                  onToggleHidden={handleToggleHidden}
                  onReview={handleReviewItem}
                  onDownload={handleDownloadItem}
                  onReorder={handleReorderItem}
                  pendingPanel={pendingPanel}
                  onClearPanel={() => setPendingPanel(null)}
                  cardLayout={customization.cardLayout}
                  cardStyle={customization.cardStyle}
                  spacing={customization.spacing}
                  cardRadius={customization.cardRadius}
                />
              );
            })
          )}
        </main>

        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-zinc-800/90 backdrop-blur-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700 shadow-xl shadow-black/30 transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 mx-auto" />
          </button>
        )}

        <footer className="mt-8 md:mt-12 pt-6 pb-8 text-center">
          <div className="h-px mb-6" style={{ background: `linear-gradient(to right, transparent, var(--brand, #44403c)30, transparent)` }} />
          <a href="/" className="text-stone-500 hover:text-stone-300 text-xs font-mono tracking-wider transition-colors">
            {t('tpl.menu.poweredBy')}
          </a>
        </footer>
      </>

      {/* ── Sheets & Overlays ── */}
      <ItemDetailsSheet
        item={selectedItem}
        allItems={menuItems}
        brandColor={brand}
        showPrices={menuSettings.showPrices}
        currency={menuSettings.currency}
        onClose={() => setSelectedItem(null)}
        onView3D={() => {
          if (selectedItem) openViewer(selectedItem);
        }}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {viewerItem && (
        <ErrorBoundary>
          <ModelViewerOverlay
            item={viewerItem}
            items={menuItems}
            allItems={menuItems}
            currentIndex={menuItems.findIndex((i) => i.id === viewerItem.id)}
            brandColor={brand}
            showPrices={menuSettings.showPrices}
            currency={menuSettings.currency}
            isEditMode={isEditMode}
            onClose={() => setViewerItem(null)}
            onNavigate={navigateViewer}
            onDelete={() => {
              handleDeleteItem(viewerItem.id);
              setViewerItem(null);
            }}
            onDuplicate={() => handleDuplicateItem(viewerItem.id)}
            onToggleHidden={() => handleToggleHidden(viewerItem.id)}
            onUpdate={(field, value) => handleUpdateItem(viewerItem.id, field, value)}
            onDownload={(type) => handleDownloadItem(viewerItem.id, type)}
            onSelectItem={(item) => {
              if (item.modelUrl) {
                setViewerItem(item);
              } else {
                setViewerItem(null);
                setSelectedItem(item);
              }
            }}
            fieldVisibility={menuSettings.fieldVisibility}
          />
        </ErrorBoundary>
      )}

      <HowARPopup open={showHowAR} onClose={() => setShowHowAR(false)} brandColor={brand} />

      {/* Customization Panel — bottom-right floating */}
      <CustomizationPanel
        state={customization}
        onChange={handleCustomizationChange}
        isOpen={isCustomizePanelOpen}
        onClose={() => setIsCustomizePanelOpen(false)}
        presets={savedPresets}
        activePresetId={activePresetId}
        onSavePreset={(name) => {
          savePreset(name, customization);
          success(t('tpl.menu.presetSaved', { defaultValue: `Layout "${name}" saved!` }));
        }}
        onLoadPreset={(presetId) => {
          const loaded = loadPreset(presetId);
          if (loaded) {
            setCustomization(loaded);
            if (loaded.customBrandColor) {
              setMenuSettings((ms) => ({ ...ms, brandColor: loaded.customBrandColor }));
            } else {
              const theme = THEME_PRESETS.find((tp) => tp.id === loaded.themePreset);
              if (theme) setMenuSettings((ms) => ({ ...ms, brandColor: theme.brandColor }));
            }
          }
        }}
        onDeletePreset={deletePreset}
        onUpdatePreset={(presetId) => {
          updatePreset(presetId, customization);
          success(t('tpl.menu.presetUpdated', { defaultValue: 'Layout preset updated!' }));
        }}
      />

      {/* Hidden model-viewer for direct AR launch */}
      <model-viewer
        ref={(el: HTMLElement | null) => { arViewerRef.current = el; }}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
        loading="lazy"
        interaction-prompt="none"
      />
    </div>
  );
};

export default RestaurantMenu;
