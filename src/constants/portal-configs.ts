import { IndustryPortalConfig } from '@/types';
import {
  ChefHat,
  Building2,
  ShoppingBag,
  Home,
  BookOpen,
  Clock,
  Layers,
  Hotel,
  Package,
  Map,
} from 'lucide-react';

export const PORTAL_CONFIGS: Record<string, IndustryPortalConfig> = {
  Restaurant: {
    id: 'Restaurant',
    theme: {
      accent: 'brand',
      accentBg: 'bg-brand-50',
      accentBgDark: 'dark:bg-brand-900/20',
      accentText: 'text-brand-600',
      accentTextDark: 'dark:text-brand-400',
      gradient: 'from-brand-600 to-violet-600',
      iconComponent: ChefHat,
    },
    labels: {
      welcome: 'portal.industry.restaurant.welcome',
      assets: 'portal.industry.restaurant.assets',
      assetSingular: 'portal.industry.restaurant.assetSingular',
      projects: 'portal.industry.restaurant.projects',
      newRequest: 'portal.industry.restaurant.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.restaurant.kpi.active',
        iconComponent: BookOpen,
        colorBg: 'bg-brand-50 dark:bg-brand-900/20',
        colorText: 'text-brand-600 dark:text-brand-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.restaurant.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.restaurant.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'analytics',
      'projectProgress',
      'assetGrid',
      'downloadCenter',
      'embedGenerator',
      'qrCodeManager',
    ],
  },

  Hospitality: {
    id: 'Hospitality',
    theme: {
      accent: 'sky',
      accentBg: 'bg-sky-50',
      accentBgDark: 'dark:bg-sky-900/20',
      accentText: 'text-sky-600',
      accentTextDark: 'dark:text-sky-400',
      gradient: 'from-sky-600 to-indigo-600',
      iconComponent: Building2,
    },
    labels: {
      welcome: 'portal.industry.hospitality.welcome',
      assets: 'portal.industry.hospitality.assets',
      assetSingular: 'portal.industry.hospitality.assetSingular',
      projects: 'portal.industry.hospitality.projects',
      newRequest: 'portal.industry.hospitality.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.hospitality.kpi.active',
        iconComponent: Hotel,
        colorBg: 'bg-sky-50 dark:bg-sky-900/20',
        colorText: 'text-sky-600 dark:text-sky-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.hospitality.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.hospitality.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'assetGrid',
      'qrCodeManager',
      'downloadCenter',
      'analytics',
      'projectProgress',
    ],
  },

  Retail: {
    id: 'Retail',
    theme: {
      accent: 'orange',
      accentBg: 'bg-orange-50',
      accentBgDark: 'dark:bg-orange-900/20',
      accentText: 'text-orange-600',
      accentTextDark: 'dark:text-orange-400',
      gradient: 'from-orange-600 to-amber-600',
      iconComponent: ShoppingBag,
    },
    labels: {
      welcome: 'portal.industry.retail.welcome',
      assets: 'portal.industry.retail.assets',
      assetSingular: 'portal.industry.retail.assetSingular',
      projects: 'portal.industry.retail.projects',
      newRequest: 'portal.industry.retail.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.retail.kpi.active',
        iconComponent: Package,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.retail.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-blue-50 dark:bg-blue-900/20',
        colorText: 'text-blue-600 dark:text-blue-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.retail.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'assetGrid',
      'embedGenerator',
      'downloadCenter',
      'analytics',
      'projectProgress',
    ],
  },

  RealEstate: {
    id: 'RealEstate',
    theme: {
      accent: 'emerald',
      accentBg: 'bg-emerald-50',
      accentBgDark: 'dark:bg-emerald-900/20',
      accentText: 'text-emerald-600',
      accentTextDark: 'dark:text-emerald-400',
      gradient: 'from-emerald-600 to-teal-600',
      iconComponent: Home,
    },
    labels: {
      welcome: 'portal.industry.realEstate.welcome',
      assets: 'portal.industry.realEstate.assets',
      assetSingular: 'portal.industry.realEstate.assetSingular',
      projects: 'portal.industry.realEstate.projects',
      newRequest: 'portal.industry.realEstate.newRequest',
    },
    kpis: [
      {
        label: 'portal.industry.realEstate.kpi.active',
        iconComponent: Map,
        colorBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        colorText: 'text-emerald-600 dark:text-emerald-400',
        valueKey: 'activeProjects',
      },
      {
        label: 'portal.industry.realEstate.kpi.inReview',
        iconComponent: Clock,
        colorBg: 'bg-orange-50 dark:bg-orange-900/20',
        colorText: 'text-orange-600 dark:text-orange-400',
        valueKey: 'inReview',
      },
      {
        label: 'portal.industry.realEstate.kpi.live',
        iconComponent: Layers,
        colorBg: 'bg-teal-50 dark:bg-teal-900/20',
        colorText: 'text-teal-600 dark:text-teal-400',
        valueKey: 'published',
      },
    ],
    widgets: [
      'assetReview',
      'assetGrid',
      'qrCodeManager',
      'downloadCenter',
      'analytics',
      'projectProgress',
    ],
  },
};

/** Get config for an industry, defaulting to Restaurant */
export function getPortalConfig(industry?: string): IndustryPortalConfig {
  if (industry && PORTAL_CONFIGS[industry]) {
    return PORTAL_CONFIGS[industry];
  }
  return PORTAL_CONFIGS.Restaurant;
}
