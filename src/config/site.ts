/**
 * Site-wide constants
 *
 * Single source of truth for the canonical domain, brand name,
 * and any other site-level values that appear in SEO tags,
 * structured data, and across components.
 *
 * No component should hardcode "3dempyre.com" — import from here.
 */

// ── Brand ────────────────────────────────────────────────────────
export const SITE_NAME = '3Difys';
export const SITE_NAME_SHORT = '3Difys';

// ── URLs ─────────────────────────────────────────────────────────
export const SITE_ORIGIN = 'https://3dempyre.com';
export const SITE_LOGO = `${SITE_ORIGIN}/logo.png`;
export const SITE_OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;

// ── Contact ──────────────────────────────────────────────────────
export const CONTACT_EMAIL = 'info@3dempyre.com';

// ── 3D Model assets ─────────────────────────────────────────────
const MODEL_BASE = '/models/AdvancedExport';

export const DEMO_MODELS = {
  astronaut: {
    glb: `${MODEL_BASE}/3DModel_Custom.gltf`,
    usdz: `${MODEL_BASE}/3DModel_Custom.gltf`,
    poster: '/images/2N2A1724.webp',
  },
  materialSuite: {
    glb: `${MODEL_BASE}/3DModel_Custom.gltf`,
    poster: `${MODEL_BASE}/3DModel_Custom.jpg`,
  },
} as const;

// ── Placeholder images ───────────────────────────────────────────
// Inline SVG data URIs replace external picsum.photos calls on public pages.
// These are lightweight (~200 bytes each) and load instantly.
export const PLACEHOLDER_BEFORE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
      '<rect fill="#18181b" width="800" height="500"/>' +
      '<rect fill="#27272a" x="100" y="80" width="600" height="340" rx="24"/>' +
      '<circle fill="#3f3f46" cx="400" cy="220" r="80"/>' +
      '<rect fill="#3f3f46" x="250" y="340" width="300" height="16" rx="8"/>' +
      '<text x="400" y="470" text-anchor="middle" fill="#71717a" font-size="14" font-family="system-ui">Flat Photo</text>' +
      '</svg>'
  );

export const PLACEHOLDER_AFTER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs>' +
      '<rect fill="#18181b" width="800" height="500"/>' +
      '<rect fill="url(#g)" x="100" y="80" width="600" height="340" rx="24" opacity="0.15"/>' +
      '<rect stroke="url(#g)" stroke-width="2" fill="none" x="100" y="80" width="600" height="340" rx="24"/>' +
      '<polygon fill="#7c3aed" points="360,180 360,280 440,230" opacity="0.6"/>' +
      '<circle fill="#7c3aed" cx="400" cy="160" r="40" opacity="0.3"/>' +
      '<rect fill="#7c3aed" x="250" y="340" width="300" height="16" rx="8" opacity="0.3"/>' +
      '<text x="400" y="470" text-anchor="middle" fill="#a78bfa" font-size="14" font-family="system-ui">Interactive 3D</text>' +
      '</svg>'
  );

// ── Generic placeholder generator ────────────────────────────────
// Creates inline SVG data URIs for any thumbnail / hero placeholder.
// Used by templates, editor, and mock data to avoid external picsum.photos calls.
export const placeholder = (w: number, h: number, label: string, hue = 270): string =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<defs>` +
        `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
          `<stop offset="0%" stop-color="hsl(${hue},15%,12%)"/>` +
          `<stop offset="100%" stop-color="hsl(${hue},20%,8%)"/>` +
        `</linearGradient>` +
      `</defs>` +
      `<rect fill="url(#bg)" width="${w}" height="${h}"/>` +
      /* Subtle utensils icon */
      `<g transform="translate(${w / 2 - 16}, ${h * 0.35})" fill="none" stroke="hsl(${hue},25%,35%)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
        `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>` + // fork
        `<line x1="8" y1="2" x2="8" y2="8"/>` +
        `<line x1="11" y1="2" x2="11" y2="5"/>` +
        `<path d="M21 15V2c-2 0-4 1.5-4 5s2 5 4 5"/>` + // knife
        `<path d="M8 11v11M21 15v7"/>` + // handles
      `</g>` +
      `<text x="${w / 2}" y="${h * 0.72}" text-anchor="middle" fill="hsl(${hue},20%,40%)" font-size="${Math.max(11, w * 0.032)}" font-family="system-ui" font-weight="500" letter-spacing="0.05em">${label}</text>` +
      '</svg>'
  );

// ── Copy constants ───────────────────────────────────────────────
export const CTA_TEXT = 'Get a Free Quote';
export const REASSURANCE_TEXT = 'No credit card required \u00B7 Free quote in 24 hours';
