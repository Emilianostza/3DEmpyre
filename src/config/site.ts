/**
 * Site-wide constants
 *
 * Single source of truth for the canonical domain, brand name,
 * and any other site-level values that appear in SEO tags,
 * structured data, and across components.
 *
 * No component should hardcode "managedcapture3d.com" — import from here.
 */

// ── Brand ────────────────────────────────────────────────────────
export const SITE_NAME = '3D Empyre';
export const SITE_NAME_SHORT = '3D Empyre';

// ── URLs ─────────────────────────────────────────────────────────
export const SITE_ORIGIN = 'https://managedcapture3d.com';
export const SITE_LOGO = `${SITE_ORIGIN}/logo.png`;
export const SITE_OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;

// ── Contact ──────────────────────────────────────────────────────
export const CONTACT_EMAIL = 'info@managedcapture.com';

// ── 3D Model assets ─────────────────────────────────────────────
const MODEL_BASE = '/models/AdvancedExport';

export const DEMO_MODELS = {
  astronaut: {
    glb: `${MODEL_BASE}/3DModel_Custom.gltf`,
    usdz: `${MODEL_BASE}/3DModel_Custom.gltf`,
    poster: `${MODEL_BASE}/3DModel_Custom.jpg`,
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
      `<rect fill="#18181b" width="${w}" height="${h}"/>` +
      `<rect fill="hsl(${hue},30%,20%)" x="${w * 0.1}" y="${h * 0.15}" width="${w * 0.8}" height="${h * 0.6}" rx="12"/>` +
      `<text x="${w / 2}" y="${h * 0.55}" text-anchor="middle" fill="hsl(${hue},40%,55%)" font-size="${Math.max(12, w * 0.04)}" font-family="system-ui">${label}</text>` +
      '</svg>'
  );

// ── Copy constants ───────────────────────────────────────────────
export const CTA_TEXT = 'Get a Free Quote';
export const REASSURANCE_TEXT = 'No credit card required \u00B7 Free quote in 24 hours';
