import React from 'react';
import { IndustryConfig } from '@/types';
import { placeholder } from '@/config/site';
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
      // Hidden until ready — keep the data, just not in nav
      // { label: 'nav.hospitality', path: '/industries/hospitality' },
      { label: 'nav.retail', path: '/industries/retail' },
      // { label: 'nav.realEstate', path: '/industries/real-estate' },
    ],
  },
  { label: 'nav.howItWorks', path: '/how-it-works' },
  { label: 'nav.library', path: '/library' },
  { label: 'nav.caseStudies', path: '/case-studies' },
  { label: 'nav.pricing', path: '/pricing' },
];

export const INDUSTRIES: Record<string, IndustryConfig> = {
  restaurants: {
    id: 'restaurants',
    title: 'Turn your signature items into interactive 3D',
    subtitle: '3Difys by employees + web/AR-ready delivery for menus and marketing.',
    heroImage: placeholder(1200, 600, '3D Restaurant Experience', 270),
    demoImage: placeholder(800, 600, 'Interactive 3D Demo', 250),
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
      { name: 'Signature Burger', thumb: placeholder(600, 500, 'Burger', 15), tag: 'Food' },
      { name: 'Truffle Pasta', thumb: placeholder(600, 500, 'Pasta', 35), tag: 'Food' },
      { name: 'Espresso Machine', thumb: placeholder(600, 500, 'Espresso', 25), tag: 'Product' },
      { name: 'Dessert Platter', thumb: placeholder(600, 500, 'Dessert', 330), tag: 'Food' },
      { name: 'Wine Bottle', thumb: placeholder(600, 500, 'Wine', 0), tag: 'Product' },
      { name: 'Table Setting', thumb: placeholder(600, 500, 'Setting', 200), tag: 'Scene' },
    ],
  },
  hospitality: {
    id: 'hospitality',
    title: 'Immersive 3D tours that book rooms before guests arrive',
    subtitle:
      'We capture your hotel rooms, lobbies, and amenities — delivering web-ready 3D tours and AR experiences that let guests explore before they book.',
    heroImage: placeholder(1200, 600, '3D Hotel Experience', 200),
    demoImage: placeholder(800, 600, 'Interactive Room Tour', 190),
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
      { name: 'Hotel Suite', thumb: placeholder(600, 500, 'Suite', 200), tag: 'Room' },
      { name: 'Resort Pool', thumb: placeholder(600, 500, 'Pool', 180), tag: 'Amenity' },
      { name: 'Lobby Lounge', thumb: placeholder(600, 500, 'Lobby', 210), tag: 'Space' },
      { name: 'Conference Room', thumb: placeholder(600, 500, 'Conference', 230), tag: 'Space' },
      { name: 'Spa Treatment Room', thumb: placeholder(600, 500, 'Spa', 280), tag: 'Amenity' },
      { name: 'Restaurant Terrace', thumb: placeholder(600, 500, 'Terrace', 160), tag: 'Scene' },
    ],
  },
  retail: {
    id: 'retail',
    title: 'Product 3D that doubles conversion rates',
    subtitle:
      'We capture your products in photorealistic 3D — delivering interactive models that replace flat photography and reduce returns.',
    heroImage: placeholder(1200, 600, '3D Product Showcase', 30),
    demoImage: placeholder(800, 600, 'Interactive Product View', 20),
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
      { name: 'Designer Sneaker', thumb: placeholder(600, 500, 'Sneaker', 15), tag: 'Footwear' },
      { name: 'Leather Handbag', thumb: placeholder(600, 500, 'Handbag', 25), tag: 'Accessory' },
      { name: 'Smart Watch', thumb: placeholder(600, 500, 'Watch', 200), tag: 'Electronics' },
      { name: 'Armchair', thumb: placeholder(600, 500, 'Armchair', 35), tag: 'Furniture' },
      { name: 'Ceramic Vase', thumb: placeholder(600, 500, 'Vase', 40), tag: 'Home' },
      { name: 'Sunglasses', thumb: placeholder(600, 500, 'Sunglasses', 10), tag: 'Accessory' },
    ],
  },
  'real-estate': {
    id: 'real-estate',
    title: 'Property tours that sell homes before the first visit',
    subtitle:
      'We capture entire properties in 3D — delivering virtual walkthroughs, floor plans, and AR staging that attract buyers worldwide.',
    heroImage: placeholder(1200, 600, '3D Property Tour', 150),
    demoImage: placeholder(800, 600, 'Virtual Walkthrough', 140),
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
        thumb: placeholder(600, 500, 'Living Room', 150),
        tag: 'Interior',
      },
      { name: 'Kitchen Interior', thumb: placeholder(600, 500, 'Kitchen', 40), tag: 'Interior' },
      { name: 'Master Bedroom', thumb: placeholder(600, 500, 'Bedroom', 250), tag: 'Interior' },
      {
        name: 'Penthouse Terrace',
        thumb: placeholder(600, 500, 'Terrace', 180),
        tag: 'Exterior',
      },
      { name: 'Office Space', thumb: placeholder(600, 500, 'Office', 210), tag: 'Commercial' },
      {
        name: 'Retail Storefront',
        thumb: placeholder(600, 500, 'Storefront', 30),
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
