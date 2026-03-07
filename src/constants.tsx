import React from 'react';
import { IndustryConfig } from '@/types';
import {
  Box,
  Scan,
  Globe,
  ShoppingBag,
  Sparkles,
  Layers,
  FileOutput,
  Smartphone,
  BarChart3,
  Palette,
  Zap,
  Webhook,
} from 'lucide-react';

type NavItem = { label: string; path: string; children?: { label: string; path: string }[] };

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'nav.industries',
    path: '/industries',
    children: [
      { label: 'nav.restaurants', path: '/industries/restaurants' },
      { label: 'nav.hospitality', path: '/industries/hospitality' },
      { label: 'nav.retail', path: '/industries/retail' },
      { label: 'nav.realEstate', path: '/industries/real-estate' },
    ],
  },
  { label: 'nav.howItWorks', path: '/how-it-works' },
  { label: 'nav.library', path: '/library' },
  { label: 'nav.caseStudies', path: '/case-studies' },
  { label: 'nav.pricing', path: '/pricing' },
];

// ── Inline SVG placeholders for Industry page ──────────────────
// Replace these with real images when available
const svgPlaceholder = (w: number, h: number, label: string, hue = 270) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<rect fill="#18181b" width="${w}" height="${h}"/>` +
      `<rect fill="hsl(${hue},60%,30%)" x="${w * 0.1}" y="${h * 0.1}" width="${w * 0.8}" height="${h * 0.7}" rx="16" opacity="0.15"/>` +
      `<rect stroke="hsl(${hue},60%,40%)" stroke-width="1.5" fill="none" x="${w * 0.1}" y="${h * 0.1}" width="${w * 0.8}" height="${h * 0.7}" rx="16"/>` +
      `<text x="${w / 2}" y="${h * 0.55}" text-anchor="middle" fill="hsl(${hue},60%,65%)" font-size="${Math.round(w * 0.028)}" font-family="system-ui">${label}</text>` +
      `</svg>`
  );

export const INDUSTRIES: Record<string, IndustryConfig> = {
  restaurants: {
    id: 'restaurants',
    title: 'Turn your signature items into interactive 3D',
    subtitle: '3D Empyre by employees + web/AR-ready delivery for menus and marketing.',
    heroImage: svgPlaceholder(1200, 600, '3D Restaurant Experience', 270),
    demoImage: svgPlaceholder(800, 600, 'Interactive 3D Demo', 250),
    outcomes: [
      'Increase appetite appeal with realistic 3D food models',
      'Integrate directly into digital menus and delivery apps',
      'Generate QR codes for table-side AR experiences',
    ],
    permissions: [
      'Edit title/description/tags',
      'Create/revoke share links',
      'Generate QR codes',
      'Download delivered bundles',
    ],
    samples: [
      { name: 'Signature Burger', thumb: svgPlaceholder(600, 500, 'Burger', 15), tag: 'Food' },
      { name: 'Truffle Pasta', thumb: svgPlaceholder(600, 500, 'Pasta', 35), tag: 'Food' },
      { name: 'Espresso Machine', thumb: svgPlaceholder(600, 500, 'Espresso', 25), tag: 'Product' },
      { name: 'Dessert Platter', thumb: svgPlaceholder(600, 500, 'Dessert', 330), tag: 'Food' },
      { name: 'Wine Bottle', thumb: svgPlaceholder(600, 500, 'Wine', 0), tag: 'Product' },
      { name: 'Table Setting', thumb: svgPlaceholder(600, 500, 'Setting', 200), tag: 'Scene' },
    ],
  },
  hospitality: {
    id: 'hospitality',
    title: 'Immersive 3D tours that book rooms before guests arrive',
    subtitle:
      'We capture your hotel rooms, lobbies, and amenities — delivering web-ready 3D tours and AR experiences that let guests explore before they book.',
    heroImage: svgPlaceholder(1200, 600, '3D Hotel Experience', 200),
    demoImage: svgPlaceholder(800, 600, 'Interactive Room Tour', 190),
    outcomes: [
      'Increase bookings with virtual room walkthroughs',
      'Showcase amenities, lobbies, and event spaces in 3D',
      'Reduce no-shows by setting accurate guest expectations',
    ],
    permissions: [
      'Edit title/description/tags',
      'Create/revoke share links',
      'Generate QR codes',
      'Download delivered bundles',
    ],
    samples: [
      { name: 'Hotel Suite', thumb: svgPlaceholder(600, 500, 'Suite', 200), tag: 'Room' },
      { name: 'Resort Pool', thumb: svgPlaceholder(600, 500, 'Pool', 180), tag: 'Amenity' },
      { name: 'Lobby Lounge', thumb: svgPlaceholder(600, 500, 'Lobby', 210), tag: 'Space' },
      { name: 'Conference Room', thumb: svgPlaceholder(600, 500, 'Conference', 230), tag: 'Space' },
      { name: 'Spa Treatment Room', thumb: svgPlaceholder(600, 500, 'Spa', 280), tag: 'Amenity' },
      { name: 'Restaurant Terrace', thumb: svgPlaceholder(600, 500, 'Terrace', 160), tag: 'Scene' },
    ],
  },
  retail: {
    id: 'retail',
    title: 'Product 3D that doubles conversion rates',
    subtitle:
      'We capture your products in photorealistic 3D — delivering interactive models that replace flat photography and reduce returns.',
    heroImage: svgPlaceholder(1200, 600, '3D Product Showcase', 30),
    demoImage: svgPlaceholder(800, 600, 'Interactive Product View', 20),
    outcomes: [
      'Double online conversion with interactive 3D product views',
      'Reduce returns by giving customers accurate product previews',
      'Generate AR try-before-you-buy experiences from one capture session',
    ],
    permissions: [
      'Edit title/description/tags',
      'Create/revoke share links',
      'Generate embed codes',
      'Download delivered bundles',
    ],
    samples: [
      { name: 'Designer Sneaker', thumb: svgPlaceholder(600, 500, 'Sneaker', 15), tag: 'Footwear' },
      { name: 'Leather Handbag', thumb: svgPlaceholder(600, 500, 'Handbag', 25), tag: 'Accessory' },
      { name: 'Smart Watch', thumb: svgPlaceholder(600, 500, 'Watch', 200), tag: 'Electronics' },
      { name: 'Armchair', thumb: svgPlaceholder(600, 500, 'Armchair', 35), tag: 'Furniture' },
      { name: 'Ceramic Vase', thumb: svgPlaceholder(600, 500, 'Vase', 40), tag: 'Home' },
      { name: 'Sunglasses', thumb: svgPlaceholder(600, 500, 'Sunglasses', 10), tag: 'Accessory' },
    ],
  },
  'real-estate': {
    id: 'real-estate',
    title: 'Property tours that sell homes before the first visit',
    subtitle:
      'We capture entire properties in 3D — delivering virtual walkthroughs, floor plans, and AR staging that attract buyers worldwide.',
    heroImage: svgPlaceholder(1200, 600, '3D Property Tour', 150),
    demoImage: svgPlaceholder(800, 600, 'Virtual Walkthrough', 140),
    outcomes: [
      'Get 133% more listing views with 3D virtual tours',
      "Attract international buyers who can't visit in person",
      'Reduce time-on-market with immersive property previews',
    ],
    permissions: [
      'Edit title/description/tags',
      'Create/revoke share links',
      'Generate QR codes',
      'Download delivered bundles',
    ],
    samples: [
      {
        name: 'Modern Living Room',
        thumb: svgPlaceholder(600, 500, 'Living Room', 150),
        tag: 'Interior',
      },
      { name: 'Kitchen Interior', thumb: svgPlaceholder(600, 500, 'Kitchen', 40), tag: 'Interior' },
      { name: 'Master Bedroom', thumb: svgPlaceholder(600, 500, 'Bedroom', 250), tag: 'Interior' },
      {
        name: 'Penthouse Terrace',
        thumb: svgPlaceholder(600, 500, 'Terrace', 180),
        tag: 'Exterior',
      },
      { name: 'Office Space', thumb: svgPlaceholder(600, 500, 'Office', 210), tag: 'Commercial' },
      {
        name: 'Retail Storefront',
        thumb: svgPlaceholder(600, 500, 'Storefront', 30),
        tag: 'Commercial',
      },
    ],
  },
};

export const HOW_IT_WORKS_STEPS = [
  {
    title: 'Intake',
    desc: 'Submit your request details and logistics preferences.',
    icon: <Box className="w-6 h-6" />,
  },
  {
    title: 'Employee Capture',
    desc: 'Our trained experts arrive on-site or receive your shipment.',
    icon: <Scan className="w-6 h-6" />,
  },
  {
    title: 'Processing & QA',
    desc: 'Assets are processed into optimized 3D web formats.',
    icon: <Globe className="w-6 h-6" />,
  },
  {
    title: 'Review & Publish',
    desc: 'Approve assets in the portal and publish instantly.',
    icon: <ShoppingBag className="w-6 h-6" />,
  },
];

export const PLATFORM_CAPABILITIES = [
  {
    id: 'ai-processing',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'brand',
  },
  {
    id: 'gaussian-splatting',
    icon: <Layers className="w-5 h-5" />,
    color: 'purple',
  },
  {
    id: 'multi-format',
    icon: <FileOutput className="w-5 h-5" />,
    color: 'cyan',
  },
  {
    id: 'web-ar',
    icon: <Smartphone className="w-5 h-5" />,
    color: 'green',
  },
  {
    id: 'analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'amber',
  },
  {
    id: 'configurator',
    icon: <Palette className="w-5 h-5" />,
    color: 'rose',
  },
  {
    id: 'global-cdn',
    icon: <Zap className="w-5 h-5" />,
    color: 'emerald',
  },
  {
    id: 'api-webhooks',
    icon: <Webhook className="w-5 h-5" />,
    color: 'orange',
  },
];
