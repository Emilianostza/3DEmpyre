import type { ChatContext, QuickAction } from './types';

interface ResponseRule {
  keywords: string[];
  response: string | ((ctx: ChatContext) => string);
  priority: number;
}

const rules: ResponseRule[] = [
  // ── Plan comparisons (priority 10) ──
  {
    keywords: ['standard plan', 'basic plan', 'cheapest', 'starter'],
    response:
      'The **Standard plan** is €18/month — perfect for getting started. It includes 1,000 views/month and 2 GB storage, ideal for small menus or a few showcase items.',
    priority: 10,
  },
  {
    keywords: ['pro plan', 'popular', 'recommended plan'],
    response:
      'The **Pro plan** at €35/month is our most popular choice! You get 2,000 views/month and 8 GB storage — great for restaurants with full menus or growing businesses.',
    priority: 10,
  },
  {
    keywords: ['ultra plan', 'premium', 'best plan', 'top tier'],
    response:
      'The **Ultra plan** (€48/month) is our top tier with 5,000 views/month and 25 GB storage. Ideal for large catalogs, multi-location businesses, or high-traffic sites.',
    priority: 10,
  },
  {
    keywords: ['which plan', 'best for me', 'recommend', 'plan for me', 'what plan'],
    response: (ctx) => {
      if (ctx.industry === 'Restaurant') {
        return 'For restaurants, I\'d recommend the **Pro plan** — it handles full menus beautifully with 2,000 views/month. If you have multiple locations, the Ultra plan gives you room to grow!';
      }
      return 'It depends on your needs! **Standard** (€18/mo) is great for small projects, **Pro** (€35/mo) for growing businesses, and **Ultra** (€48/mo) for large catalogs. How many items are you looking to capture?';
    },
    priority: 10,
  },
  {
    keywords: ['compare plan', 'difference between', 'plan comparison'],
    response:
      'Here\'s a quick comparison:\n\n• **Standard** (€18/mo) — 1,000 views, 2 GB storage\n• **Pro** (€35/mo) — 2,000 views, 8 GB storage ⭐ Most popular\n• **Ultra** (€48/mo) — 5,000 views, 25 GB storage\n\nAll plans include hosted 3D viewers and AR support!',
    priority: 10,
  },

  // ── Pricing (priority 8) ──
  {
    keywords: ['pricing', 'cost', 'how much', 'price', 'expensive', 'affordable'],
    response:
      'Pricing has two parts: a **one-time capture fee** (starting at €20/item for restaurants, €290/item for standard objects) and a **monthly platform subscription** (€18–48/month). Volume discounts kick in at 10+ items! The estimate sidebar updates in real-time as you fill out the form.',
    priority: 8,
  },
  {
    keywords: ['discount', 'bulk', 'volume', 'batch'],
    response:
      'Yes! We offer batch discounts:\n\n• **10% off** for 10+ items\n• **20% off** for 25+ items\n• **25% off** for 100+ items\n\nThe more you capture, the more you save!',
    priority: 8,
  },

  // ── Deliverables (priority 8) ──
  {
    keywords: ['deliverable', 'what do i get', 'output', 'included', 'what deliverable'],
    response:
      'You can choose from:\n\n• **Hosted viewer links** — shareable 3D viewer URLs (most popular!)\n• **Website embeds** — drop-in code for your site\n• **AR experiences** — iOS & Android\n• **Raw 3D files** — GLB, USDZ formats\n• **QR codes** — for physical menus & displays\n\nI\'d recommend starting with the hosted viewer link — it works everywhere!',
    priority: 8,
  },
  {
    keywords: ['ar', 'augmented reality', 'ar experience'],
    response:
      'AR (Augmented Reality) lets your customers view 3D models in their real environment through their phone camera. We support both **iOS (USDZ)** and **Android (GLB)** formats. It\'s especially popular for furniture, decor, and restaurant dishes — customers love seeing items at real scale!',
    priority: 8,
  },
  {
    keywords: ['qr code', 'qr'],
    response:
      'QR codes are perfect for physical locations! Place them on table tents, product tags, or signage, and customers can instantly view your 3D models on their phones. Great for restaurants and retail spaces.',
    priority: 8,
  },
  {
    keywords: ['embed', 'website', 'iframe'],
    response:
      'Our website embed gives you a simple code snippet you can drop into any webpage. The 3D viewer loads instantly, works on all devices, and supports full interaction — rotate, zoom, and AR launch. No coding skills required!',
    priority: 8,
  },

  // ── Process / logistics (priority 6) ──
  {
    keywords: ['on-site', 'on site', 'ship', 'location', 'come to', 'ship-in'],
    response:
      'Two options:\n\n• **On-site capture** — we come to you (€100/visit for restaurants, €900/day for general)\n• **Ship-in** — you send items to our studio\n\nOn-site is great for installed items or interiors. Ship-in works best for products and smaller items.',
    priority: 6,
  },
  {
    keywords: ['how long', 'timeline', 'turnaround', 'when ready'],
    response:
      'After submitting your request, you\'ll receive a detailed quote within **24 hours**. Once approved, typical turnaround is 5–10 business days depending on volume and complexity. We\'ll keep you updated through your client portal!',
    priority: 6,
  },
  {
    keywords: ['submit', 'what happens', 'after submit', 'next step'],
    response:
      'After you submit:\n\n1. We review your request and send a detailed quote within **24 hours**\n2. Once you approve, we schedule the capture\n3. You receive your 3D models ready to use!\n\nNo credit card needed — this is a free, no-obligation quote.',
    priority: 6,
  },
  {
    keywords: ['secure', 'security', 'data', 'privacy', 'safe', 'gdpr'],
    response:
      'Absolutely! We\'re **SOC 2 Compliant** and **GDPR-ready**. Your data is encrypted in transit and at rest. We never share your information with third parties.',
    priority: 6,
  },
  {
    keywords: ['change', 'edit', 'modify', 'go back', 'undo'],
    response:
      'Yes! You can go back to any completed step by clicking the step indicators at the top. Your progress is automatically saved, so nothing gets lost. After submitting, our team can also accommodate changes before capture begins.',
    priority: 6,
  },
  {
    keywords: ['country', 'international', 'where', 'available', 'serve'],
    response:
      'We serve clients worldwide! Our on-site capture teams operate across Europe, and we accept ship-in items from anywhere globally. Just select your country in the form and we\'ll handle the logistics.',
    priority: 6,
  },

  // ── Industry (priority 6) ──
  {
    keywords: ['restaurant', 'food', 'menu', 'dish'],
    response:
      'Restaurants are our specialty! We capture dishes, desserts, and beverages as stunning 3D models. Customers can view your menu items from every angle, boosting engagement by up to 30%. Starting at just €20/item!',
    priority: 6,
  },
  {
    keywords: ['retail', 'product', 'shop', 'store', 'ecommerce'],
    response:
      'For retail, we create high-fidelity 3D models of your products — perfect for e-commerce, virtual try-on, and in-store displays. Starting at €290/item for standard-size products.',
    priority: 6,
  },
  {
    keywords: ['real estate', 'property', 'space', 'room', 'interior'],
    response:
      'For real estate, we capture full spaces and interiors as immersive 3D experiences. Virtual tours and spatial models help buyers explore properties remotely.',
    priority: 6,
  },
  {
    keywords: ['industry', 'what industries', 'who do you serve', 'what do you do'],
    response:
      'We serve **Restaurants** (3D menu items), **Hospitality** (hotels, venues), **Retail** (product catalogs), **Real Estate** (virtual tours), and **General** (any object or space). Each gets specialized capture techniques!',
    priority: 6,
  },

  // ── General (priority 2) ──
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'hola'],
    response:
      'Hi there! 👋 I\'m here to help you with your 3D capture request. Feel free to ask about our plans, pricing, deliverables, or the capture process. What would you like to know?',
    priority: 2,
  },
  {
    keywords: ['3d capture', 'what is', 'how does it work', 'explain', 'photogrammetry'],
    response:
      '3D capture uses professional photogrammetry to create photorealistic, interactive 3D models of real objects and spaces. We handle everything — capture, processing, and hosting. Your models can be embedded on websites, shared via links, or experienced in AR!',
    priority: 2,
  },
  {
    keywords: ['thank', 'thanks', 'awesome', 'great', 'perfect'],
    response:
      'You\'re welcome! If you have any other questions while filling out the form, I\'m right here. Good luck with your project! 🎉',
    priority: 2,
  },
];

const FALLBACK =
  'I\'m not sure I understand that question. Try asking about our **plans**, **pricing**, **deliverables**, or the **capture process** — or click one of the quick suggestions!';

export function getResponse(userMessage: string, context: ChatContext): string {
  const msg = userMessage.toLowerCase();

  const sorted = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (rule.keywords.some((kw) => msg.includes(kw))) {
      return typeof rule.response === 'function' ? rule.response(context) : rule.response;
    }
  }

  return FALLBACK;
}

export function getQuickActions(context: ChatContext): QuickAction[] {
  const base: QuickAction[] = [];

  if (context.currentStep === 1) {
    base.push(
      { id: 'q1', label: '💡 What plan is best for me?', query: 'What plan is best for me?' },
      { id: 'q2', label: '💰 How does pricing work?', query: 'How does pricing work?' },
      { id: 'q3', label: '🏢 What industries do you serve?', query: 'What industries do you serve?' },
      { id: 'q4', label: '📊 Compare plans', query: 'Compare the plans for me' },
    );
  } else if (context.currentStep === 2) {
    base.push(
      { id: 'q5', label: '📦 What deliverables should I pick?', query: 'What deliverables should I choose?' },
      { id: 'q6', label: '📍 On-site vs ship-in?', query: 'Should I choose on-site or ship-in?' },
      { id: 'q7', label: '📱 Do I need AR?', query: 'What is AR and do I need it?' },
      { id: 'q8', label: '🌍 Do you serve my country?', query: 'Do you serve my country?' },
    );
  } else if (context.currentStep === 3) {
    base.push(
      { id: 'q9', label: '🔒 Is my data secure?', query: 'Is my data secure?' },
      { id: 'q10', label: '📋 What happens after I submit?', query: 'What happens after I submit?' },
      { id: 'q11', label: '⏱️ How long until I get my quote?', query: 'How long until I get my quote?' },
      { id: 'q12', label: '✏️ Can I change my selections?', query: 'Can I change my selections later?' },
    );
  }

  return base;
}

export const WELCOME_MESSAGE =
  'Hi! 👋 I\'m your quote assistant. I can help you choose the right plan, understand pricing, or answer any questions about our 3D capture services. What would you like to know?';
