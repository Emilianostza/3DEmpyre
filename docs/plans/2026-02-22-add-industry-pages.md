# Add 3 Industry Landing Pages — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Hospitality, Retail, and Real Estate industry landing pages with an Industries dropdown nav, footer links, updated request form, and full i18n in 4 locales.

**Architecture:** Extend the existing `INDUSTRIES` config object in `constants.tsx` with 3 new entries. The dynamic `Industry.tsx` page already handles rendering any config. Update `NAV_ITEMS` to use a parent "Industries" item with `children` (dropdown already supported in Layout). Add i18n keys to all 4 locale files. Update `RequestForm.tsx` to show 4 industry buttons.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 3, react-i18next, react-router-dom

---

### Task 1: Add Industry Enum Values

**Files:**

- Modify: `src/types.ts:3-6`

**Step 1: Add new enum values**

In `src/types.ts`, change the `Industry` enum from:

```typescript
export enum Industry {
  Restaurant = 'Restaurant',
  General = 'General',
}
```

To:

```typescript
export enum Industry {
  Restaurant = 'Restaurant',
  Hospitality = 'Hospitality',
  Retail = 'Retail',
  RealEstate = 'RealEstate',
  General = 'General',
}
```

**Step 2: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds (existing code still compiles — enum is additive)

---

### Task 2: Add 3 Industry Configs to Constants

**Files:**

- Modify: `src/constants.tsx:28-55`

**Step 1: Add hospitality, retail, and real-estate configs**

After the existing `restaurants` entry in `INDUSTRIES` (line 54, after the closing `},`), add these three entries:

```typescript
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
      'Attract international buyers who can\'t visit in person',
      'Reduce time-on-market with immersive property previews',
    ],
    permissions: [
      'Edit title/description/tags',
      'Create/revoke share links',
      'Generate QR codes',
      'Download delivered bundles',
    ],
    samples: [
      { name: 'Modern Living Room', thumb: svgPlaceholder(600, 500, 'Living Room', 150), tag: 'Interior' },
      { name: 'Kitchen Interior', thumb: svgPlaceholder(600, 500, 'Kitchen', 40), tag: 'Interior' },
      { name: 'Master Bedroom', thumb: svgPlaceholder(600, 500, 'Bedroom', 250), tag: 'Interior' },
      { name: 'Penthouse Terrace', thumb: svgPlaceholder(600, 500, 'Terrace', 180), tag: 'Exterior' },
      { name: 'Office Space', thumb: svgPlaceholder(600, 500, 'Office', 210), tag: 'Commercial' },
      { name: 'Retail Storefront', thumb: svgPlaceholder(600, 500, 'Storefront', 30), tag: 'Commercial' },
    ],
  },
```

**Step 2: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 3: Update NAV_ITEMS to Industries Dropdown

**Files:**

- Modify: `src/constants.tsx:7-13`

**Step 1: Replace NAV_ITEMS**

Change the existing `NAV_ITEMS` from:

```typescript
export const NAV_ITEMS: NavItem[] = [
  { label: 'nav.restaurants', path: '/industries/restaurants' },
  { label: 'nav.howItWorks', path: '/how-it-works' },
  { label: 'nav.blog', path: '/blog' },
  { label: 'nav.caseStudies', path: '/case-studies' },
  { label: 'nav.pricing', path: '/pricing' },
];
```

To:

```typescript
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
  { label: 'nav.blog', path: '/blog' },
  { label: 'nav.caseStudies', path: '/case-studies' },
  { label: 'nav.pricing', path: '/pricing' },
];
```

**Step 2: Update `isActive` in Layout.tsx**

The current `isActive` function (line 46-49) already has a special case for `/industries`. Verify the existing check `path !== '/industries'` is still correct — when the parent "Industries" item has `path: '/industries'`, the `isActive` check should highlight it when any child industry page is active.

Change line 46-49 in `src/components/Layout.tsx` from:

```typescript
const isActive = (path: string) =>
  path === '/' ? barePath === '/' : path !== '/industries' && barePath.startsWith(path);
```

To:

```typescript
const isActive = (path: string) => (path === '/' ? barePath === '/' : barePath.startsWith(path));
```

This makes the "Industries" parent item highlight when any `/industries/*` route is active.

**Step 3: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 4: Update Footer with All Industry Links

**Files:**

- Modify: `src/components/Layout.tsx:245-253`

**Step 1: Replace footer industries list**

Change the footer industries section from:

```tsx
{[{ label: t('footer.restaurants'), path: '/industries/restaurants' }].map((l) => (
```

To:

```tsx
{[
  { label: t('footer.restaurants'), path: '/industries/restaurants' },
  { label: t('footer.hospitality'), path: '/industries/hospitality' },
  { label: t('footer.retail'), path: '/industries/retail' },
  { label: t('footer.realEstate'), path: '/industries/real-estate' },
].map((l) => (
```

**Step 2: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 5: Update RequestForm Industry Buttons

**Files:**

- Modify: `src/pages/RequestForm.tsx:435-447`

**Step 1: Expand industry buttons from 2 to 5**

Change the industry selection grid from:

```tsx
{[Industry.Restaurant, Industry.General].map((ind) => (
```

To:

```tsx
{[Industry.Restaurant, Industry.Hospitality, Industry.Retail, Industry.RealEstate, Industry.General].map((ind) => (
```

**Step 2: Update the grid to accommodate 5 items**

Change `grid-cols-1 sm:grid-cols-2` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
```

**Step 3: Update description text for each industry**

Change the description rendering from:

```tsx
<span className="text-xs text-zinc-500">
  {ind === Industry.Restaurant && t('requestForm.step1.industryRestaurant')}
  {ind === Industry.General && t('requestForm.step1.industryGeneral')}
</span>
```

To:

```tsx
<span className="text-xs text-zinc-500">
  {ind === Industry.Restaurant && t('requestForm.step1.industryRestaurant')}
  {ind === Industry.Hospitality && t('requestForm.step1.industryHospitality')}
  {ind === Industry.Retail && t('requestForm.step1.industryRetail')}
  {ind === Industry.RealEstate && t('requestForm.step1.industryRealEstate')}
  {ind === Industry.General && t('requestForm.step1.industryGeneral')}
</span>
```

**Step 4: Handle URL query param pre-selection**

In the `useEffect` that reads `?industry=`, around line 110-112, extend the check:

```typescript
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
```

**Step 5: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 6: Add English i18n Keys

**Files:**

- Modify: `public/locales/en/translation.json`

**Step 1: Add nav, footer, and request form keys**

Add these keys alongside the existing nav/footer keys:

```json
"nav.industries": "Industries",
"nav.hospitality": "Hospitality",
"nav.retail": "Retail & E-commerce",
"nav.realEstate": "Real Estate",

"footer.hospitality": "Hospitality",
"footer.retail": "Retail & E-commerce",
"footer.realEstate": "Real Estate",

"requestForm.step1.industryHospitality": "Hotels, resorts, vacation rentals",
"requestForm.step1.industryRetail": "Products, furniture, fashion, electronics",
"requestForm.step1.industryRealEstate": "Properties, apartments, commercial spaces",
```

**Step 2: Add industry-specific FAQ keys**

Add these keys in the `industry.*` namespace:

```json
"industry.hospitality.faq1.q": "How disruptive is the capture process for hotel guests?",
"industry.hospitality.faq1.a": "Minimal disruption. We schedule captures during low-occupancy periods and work quietly. Each room takes about 20-30 minutes to scan.",
"industry.hospitality.faq2.q": "Can you capture outdoor amenities like pools and gardens?",
"industry.hospitality.faq2.a": "Yes. Our team uses specialized outdoor scanning techniques. We recommend overcast days for best results, but can work in any conditions.",

"industry.retail.faq1.q": "What product sizes can you capture?",
"industry.retail.faq1.a": "Anything from a ring to a refrigerator. Small items (under 30cm) ship to our studio; larger items are captured on-site.",
"industry.retail.faq2.q": "How long until I get the 3D models?",
"industry.retail.faq2.a": "Standard turnaround is 3-5 business days per batch. Rush delivery (24-48h) is available for an additional 30% fee.",

"industry.realEstate.faq1.q": "Is there a limit on property size?",
"industry.realEstate.faq1.a": "No hard limit. We've captured everything from studio apartments to 500m\u00b2 commercial spaces. Larger properties may require multi-day sessions.",
"industry.realEstate.faq2.q": "Can you capture both interior and exterior?",
"industry.realEstate.faq2.a": "Yes. We capture full interior walkthroughs plus exterior facades, gardens, and terraces. Drone capture for aerial views is available as an add-on."
```

**Step 3: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 7: Add German i18n Keys

**Files:**

- Modify: `public/locales/de/translation.json`

**Step 1: Add all German translations**

Add the equivalent keys in German:

```json
"nav.industries": "Branchen",
"nav.hospitality": "Gastgewerbe",
"nav.retail": "Einzelhandel & E-Commerce",
"nav.realEstate": "Immobilien",

"footer.hospitality": "Gastgewerbe",
"footer.retail": "Einzelhandel & E-Commerce",
"footer.realEstate": "Immobilien",

"requestForm.step1.industryHospitality": "Hotels, Resorts, Ferienwohnungen",
"requestForm.step1.industryRetail": "Produkte, M\u00f6bel, Mode, Elektronik",
"requestForm.step1.industryRealEstate": "Immobilien, Wohnungen, Gewerbefl\u00e4chen",

"industry.hospitality.faq1.q": "Wie st\u00f6rend ist der Erfassungsprozess f\u00fcr Hotelg\u00e4ste?",
"industry.hospitality.faq1.a": "Minimale St\u00f6rung. Wir planen Erfassungen w\u00e4hrend Zeiten geringer Auslastung und arbeiten leise. Jedes Zimmer dauert etwa 20-30 Minuten.",
"industry.hospitality.faq2.q": "K\u00f6nnen Sie Au\u00dfenanlagen wie Pools und G\u00e4rten erfassen?",
"industry.hospitality.faq2.a": "Ja. Unser Team verwendet spezielle Au\u00dfenscantechniken. Wir empfehlen bew\u00f6lkte Tage f\u00fcr beste Ergebnisse, k\u00f6nnen aber bei allen Bedingungen arbeiten.",

"industry.retail.faq1.q": "Welche Produktgr\u00f6\u00dfen k\u00f6nnen Sie erfassen?",
"industry.retail.faq1.a": "Alles von einem Ring bis zu einem K\u00fchlschrank. Kleine Artikel (unter 30 cm) werden an unser Studio geschickt; gr\u00f6\u00dfere Artikel werden vor Ort erfasst.",
"industry.retail.faq2.q": "Wie lange dauert es, bis ich die 3D-Modelle erhalte?",
"industry.retail.faq2.a": "Standardlieferzeit betr\u00e4gt 3-5 Werktage pro Charge. Eillieferung (24-48 Std.) ist gegen einen Aufpreis von 30 % verf\u00fcgbar.",

"industry.realEstate.faq1.q": "Gibt es eine Gr\u00f6\u00dfenbeschr\u00e4nkung f\u00fcr Immobilien?",
"industry.realEstate.faq1.a": "Keine feste Grenze. Wir haben alles erfasst, von Einzimmerwohnungen bis zu 500 m\u00b2 Gewerbefl\u00e4chen. Gr\u00f6\u00dfere Objekte erfordern m\u00f6glicherweise mehrt\u00e4gige Sitzungen.",
"industry.realEstate.faq2.q": "K\u00f6nnen Sie sowohl Innen- als auch Au\u00dfenbereiche erfassen?",
"industry.realEstate.faq2.a": "Ja. Wir erfassen vollst\u00e4ndige Innenrundg\u00e4nge sowie Au\u00dfenfassaden, G\u00e4rten und Terrassen. Drohnenaufnahmen f\u00fcr Luftansichten sind als Zusatzoption verf\u00fcgbar."
```

---

### Task 8: Add Spanish i18n Keys

**Files:**

- Modify: `public/locales/es/translation.json`

**Step 1: Add all Spanish translations**

```json
"nav.industries": "Sectores",
"nav.hospitality": "Hosteler\u00eda",
"nav.retail": "Comercio y E-commerce",
"nav.realEstate": "Inmobiliaria",

"footer.hospitality": "Hosteler\u00eda",
"footer.retail": "Comercio y E-commerce",
"footer.realEstate": "Inmobiliaria",

"requestForm.step1.industryHospitality": "Hoteles, resorts, alquileres vacacionales",
"requestForm.step1.industryRetail": "Productos, muebles, moda, electr\u00f3nica",
"requestForm.step1.industryRealEstate": "Propiedades, apartamentos, espacios comerciales",

"industry.hospitality.faq1.q": "\u00bfQu\u00e9 tan disruptivo es el proceso de captura para los hu\u00e9spedes del hotel?",
"industry.hospitality.faq1.a": "M\u00ednima interrupci\u00f3n. Programamos las capturas durante per\u00edodos de baja ocupaci\u00f3n y trabajamos en silencio. Cada habitaci\u00f3n toma unos 20-30 minutos.",
"industry.hospitality.faq2.q": "\u00bfPueden capturar instalaciones exteriores como piscinas y jardines?",
"industry.hospitality.faq2.a": "S\u00ed. Nuestro equipo utiliza t\u00e9cnicas especializadas de escaneo exterior. Recomendamos d\u00edas nublados para mejores resultados, pero podemos trabajar en cualquier condici\u00f3n.",

"industry.retail.faq1.q": "\u00bfQu\u00e9 tama\u00f1os de productos pueden capturar?",
"industry.retail.faq1.a": "Cualquier cosa desde un anillo hasta un refrigerador. Los art\u00edculos peque\u00f1os (menos de 30 cm) se env\u00edan a nuestro estudio; los m\u00e1s grandes se capturan en el sitio.",
"industry.retail.faq2.q": "\u00bfCu\u00e1nto tiempo hasta que reciba los modelos 3D?",
"industry.retail.faq2.a": "El plazo est\u00e1ndar es de 3-5 d\u00edas h\u00e1biles por lote. La entrega urgente (24-48h) est\u00e1 disponible con un cargo adicional del 30%.",

"industry.realEstate.faq1.q": "\u00bfHay un l\u00edmite en el tama\u00f1o de la propiedad?",
"industry.realEstate.faq1.a": "Sin l\u00edmite fijo. Hemos capturado desde estudios hasta espacios comerciales de 500 m\u00b2. Las propiedades m\u00e1s grandes pueden requerir sesiones de varios d\u00edas.",
"industry.realEstate.faq2.q": "\u00bfPueden capturar tanto interiores como exteriores?",
"industry.realEstate.faq2.a": "S\u00ed. Capturamos recorridos interiores completos m\u00e1s fachadas exteriores, jardines y terrazas. La captura con drones para vistas a\u00e9reas est\u00e1 disponible como complemento."
```

---

### Task 9: Add Russian i18n Keys

**Files:**

- Modify: `public/locales/ru/translation.json`

**Step 1: Add all Russian translations**

```json
"nav.industries": "\u041e\u0442\u0440\u0430\u0441\u043b\u0438",
"nav.hospitality": "\u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0439 \u0431\u0438\u0437\u043d\u0435\u0441",
"nav.retail": "\u0420\u0438\u0442\u0435\u0439\u043b \u0438 \u044d-\u043a\u043e\u043c\u043c\u0435\u0440\u0446\u0438\u044f",
"nav.realEstate": "\u041d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c",

"footer.hospitality": "\u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0447\u043d\u044b\u0439 \u0431\u0438\u0437\u043d\u0435\u0441",
"footer.retail": "\u0420\u0438\u0442\u0435\u0439\u043b \u0438 \u044d-\u043a\u043e\u043c\u043c\u0435\u0440\u0446\u0438\u044f",
"footer.realEstate": "\u041d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c",

"requestForm.step1.industryHospitality": "\u0413\u043e\u0441\u0442\u0438\u043d\u0438\u0446\u044b, \u043a\u0443\u0440\u043e\u0440\u0442\u044b, \u0430\u0440\u0435\u043d\u0434\u0430 \u0436\u0438\u043b\u044c\u044f",
"requestForm.step1.industryRetail": "\u0422\u043e\u0432\u0430\u0440\u044b, \u043c\u0435\u0431\u0435\u043b\u044c, \u043c\u043e\u0434\u0430, \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u0438\u043a\u0430",
"requestForm.step1.industryRealEstate": "\u041d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c, \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u044b, \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u0438\u0435 \u043f\u043b\u043e\u0449\u0430\u0434\u0438",

"industry.hospitality.faq1.q": "\u041d\u0430\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0446\u0435\u0441\u0441 \u0441\u044a\u0451\u043c\u043a\u0438 \u043c\u0435\u0448\u0430\u0435\u0442 \u0433\u043e\u0441\u0442\u044f\u043c \u043e\u0442\u0435\u043b\u044f?",
"industry.hospitality.faq1.a": "\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0432\u043c\u0435\u0448\u0430\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u043e. \u041c\u044b \u043f\u043b\u0430\u043d\u0438\u0440\u0443\u0435\u043c \u0441\u044a\u0451\u043c\u043a\u0443 \u0432 \u043f\u0435\u0440\u0438\u043e\u0434\u044b \u043d\u0438\u0437\u043a\u043e\u0439 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0438 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u043c \u0442\u0438\u0445\u043e. \u041a\u0430\u0436\u0434\u044b\u0439 \u043d\u043e\u043c\u0435\u0440 \u0437\u0430\u043d\u0438\u043c\u0430\u0435\u0442 \u043e\u043a\u043e\u043b\u043e 20-30 \u043c\u0438\u043d\u0443\u0442.",
"industry.hospitality.faq2.q": "\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u0441\u043d\u044f\u0442\u044c \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u0437\u043e\u043d\u044b, \u0442\u0430\u043a\u0438\u0435 \u043a\u0430\u043a \u0431\u0430\u0441\u0441\u0435\u0439\u043d\u044b \u0438 \u0441\u0430\u0434\u044b?",
"industry.hospitality.faq2.a": "\u0414\u0430. \u041d\u0430\u0448\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0435 \u043c\u0435\u0442\u043e\u0434\u044b \u043d\u0430\u0440\u0443\u0436\u043d\u043e\u0433\u043e \u0441\u043a\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f. \u041c\u044b \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c \u043f\u0430\u0441\u043c\u0443\u0440\u043d\u044b\u0435 \u0434\u043d\u0438 \u0434\u043b\u044f \u043b\u0443\u0447\u0448\u0438\u0445 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u0432.",

"industry.retail.faq1.q": "\u041a\u0430\u043a\u0438\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u044b \u0442\u043e\u0432\u0430\u0440\u043e\u0432 \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0441\u043d\u0438\u043c\u0430\u0442\u044c?",
"industry.retail.faq1.a": "\u041e\u0442 \u043a\u043e\u043b\u044c\u0446\u0430 \u0434\u043e \u0445\u043e\u043b\u043e\u0434\u0438\u043b\u044c\u043d\u0438\u043a\u0430. \u041c\u0435\u043b\u043a\u0438\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b (\u0434\u043e 30 \u0441\u043c) \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u0432 \u043d\u0430\u0448\u0443 \u0441\u0442\u0443\u0434\u0438\u044e; \u043a\u0440\u0443\u043f\u043d\u044b\u0435 \u2014 \u0441\u043d\u0438\u043c\u0430\u044e\u0442\u0441\u044f \u043d\u0430 \u043c\u0435\u0441\u0442\u0435.",
"industry.retail.faq2.q": "\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438 \u0434\u043e \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044f 3D-\u043c\u043e\u0434\u0435\u043b\u0435\u0439?",
"industry.retail.faq2.a": "\u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u044b\u0439 \u0441\u0440\u043e\u043a \u2014 3-5 \u0440\u0430\u0431\u043e\u0447\u0438\u0445 \u0434\u043d\u0435\u0439 \u043d\u0430 \u043f\u0430\u0440\u0442\u0438\u044e. \u0421\u0440\u043e\u0447\u043d\u0430\u044f \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 (24-48\u0447) \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u0437\u0430 \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0435 30%.",

"industry.realEstate.faq1.q": "\u0415\u0441\u0442\u044c \u043b\u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u0435 \u043f\u043e \u0440\u0430\u0437\u043c\u0435\u0440\u0443 \u043e\u0431\u044a\u0435\u043a\u0442\u0430?",
"industry.realEstate.faq1.a": "\u0416\u0451\u0441\u0442\u043a\u0438\u0445 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u0439 \u043d\u0435\u0442. \u041c\u044b \u0441\u043d\u0438\u043c\u0430\u043b\u0438 \u043e\u0442 \u0441\u0442\u0443\u0434\u0438\u0439 \u0434\u043e \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u0438\u0445 \u043f\u043e\u043c\u0435\u0449\u0435\u043d\u0438\u0439 500 \u043c\u00b2. \u041a\u0440\u0443\u043f\u043d\u044b\u0435 \u043e\u0431\u044a\u0435\u043a\u0442\u044b \u043c\u043e\u0433\u0443\u0442 \u043f\u043e\u0442\u0440\u0435\u0431\u043e\u0432\u0430\u0442\u044c \u043c\u043d\u043e\u0433\u043e\u0434\u043d\u0435\u0432\u043d\u044b\u0445 \u0441\u0435\u0441\u0441\u0438\u0439.",
"industry.realEstate.faq2.q": "\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u0441\u043d\u044f\u0442\u044c \u0438 \u0438\u043d\u0442\u0435\u0440\u044c\u0435\u0440, \u0438 \u044d\u043a\u0441\u0442\u0435\u0440\u044c\u0435\u0440?",
"industry.realEstate.faq2.a": "\u0414\u0430. \u041c\u044b \u0441\u043d\u0438\u043c\u0430\u0435\u043c \u043f\u043e\u043b\u043d\u044b\u0435 \u0438\u043d\u0442\u0435\u0440\u044c\u0435\u0440\u043d\u044b\u0435 \u0442\u0443\u0440\u044b, \u0430 \u0442\u0430\u043a\u0436\u0435 \u0444\u0430\u0441\u0430\u0434\u044b, \u0441\u0430\u0434\u044b \u0438 \u0442\u0435\u0440\u0440\u0430\u0441\u044b. \u0421\u044a\u0451\u043c\u043a\u0430 \u0441 \u0434\u0440\u043e\u043d\u0430 \u0434\u043b\u044f \u0430\u044d\u0440\u043e\u0432\u0438\u0434\u043e\u0432 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043a\u0430\u043a \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u043e\u043f\u0446\u0438\u044f."
```

---

### Task 10: Update Industry.tsx FAQ to Use Industry-Specific Keys

**Files:**

- Modify: `src/pages/Industry.tsx`

**Step 1: Make FAQs use industry-specific i18n keys**

The current `Industry.tsx` has hardcoded FAQ keys (`industry.faq1.q`, `industry.faq2.q`). Update the FAQ section to first try industry-specific keys, falling back to generic:

Find the FAQ rendering section and update it so the FAQ items use:

- `industry.{config.id}.faq1.q` / `.a` (if it exists)
- Fallback to `industry.faq1.q` / `.a` (generic)

Use `t()` with the `defaultValue` option:

```typescript
const faqItems = [
  {
    question: t(`industry.${config.id}.faq1.q`, { defaultValue: t('industry.faq1.q') }),
    answer: t(`industry.${config.id}.faq1.a`, { defaultValue: t('industry.faq1.a') }),
  },
  {
    question: t(`industry.${config.id}.faq2.q`, { defaultValue: t('industry.faq2.q') }),
    answer: t(`industry.${config.id}.faq2.a`, { defaultValue: t('industry.faq2.a') }),
  },
];
```

**Step 2: Verify build**

Run: `npx vite build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 11: Final Build + Visual Verification

**Step 1: Full production build**

Run: `npx vite build 2>&1 | tail -10`
Expected: Build succeeds with zero errors

**Step 2: Start dev server and test**

Run: `npx vite --port 3000`

Verify in browser:

- `/industries/hospitality` loads with hospitality content
- `/industries/retail` loads with retail content
- `/industries/real-estate` loads with real estate content
- Desktop nav shows "Industries" dropdown with 4 items
- Mobile nav shows expandable Industries accordion
- Footer shows all 4 industry links
- `/request?industry=hospitality` pre-selects Hospitality
- `/request?industry=retail` pre-selects Retail
- `/request?industry=real-estate` pre-selects Real Estate
- Language switcher works on all new pages (DE, ES, RU)
