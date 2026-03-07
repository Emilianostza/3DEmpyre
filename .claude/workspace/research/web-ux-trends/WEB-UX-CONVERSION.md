# Web UX, Design & Conversion Optimization — Research

> Updated: 2026-02-20
> Sources cited inline

## 1. Key Conversion Benchmarks (2025-2026)

| Metric                              | Benchmark       | Top Performers                      |
| ----------------------------------- | --------------- | ----------------------------------- |
| SaaS landing page median conversion | 3.8%            | 11.6%+ (custom designs)             |
| Form fields sweet spot              | 5 or fewer      | 120% better conversion vs 6+ fields |
| Social proof conversion lift        | 10-270%         | Median: 37% lift                    |
| Mobile traffic share                | ~83%            | Desktop still converts ~8% better   |
| Dark mode time-on-page boost        | +10-30%         | During evening hours especially     |
| Dark mode CTA click-through boost   | +20-40%         | With proper contrast design         |
| Interactive demo above fold         | +32% activation | When shown with real numbers        |
| AI personalization revenue lift     | 5-15%           | CAC reduction up to 50%             |

---

## 2. Design Trends for Premium B2B Services (2026)

### Dark Theme (OUR CURRENT APPROACH — good choice)

- Dark mode IS the 2026 standard for tech/premium SaaS
- Black + white + one bold accent color = winning formula
- Higher engagement during evening hours
- Reduces eye strain → longer sessions
- **Warning**: One A/B test showed light variant had 16.62% higher CTR but 42% FEWER conversions — context and audience matter more than universal rules

### Hero Section Best Practices

- **Story-driven hero** > static tagline (2026 standard)
- Show product value visually within 3-5 seconds
- Leading examples: Notion, Linear, Framer use micro-animations + product workflows
- Interactive demos convert better than static animations
- Include real numbers/metrics in hero area
- **Our opportunity**: Interactive 3D model viewer in hero = unique, demonstrates product instantly

### Typography

- Display fonts for headlines (bold, tight tracking)
- System/clean sans-serif for body
- Large font sizes trending (hero headlines 4-5rem)

### Micro-interactions & Animation

- Scroll-triggered reveal animations (we have this ✓)
- Subtle gradient glows and ambient effects (we have this ✓)
- Loading state animations
- Hover micro-interactions on cards and buttons

---

## 3. Conversion Optimization Specifics

### Form Design (Our /request page)

- **5 or fewer fields** = critical threshold (each additional field = 20-30% conversion penalty)
- Progressive disclosure: show basic fields first, reveal more on interaction
- Multi-step forms convert better than single long forms
- Add inline validation (real-time feedback)
- Include "No credit card required" near CTA (we have this ✓ per CLAUDE.md)

### CTA Buttons

- Action-driven copy: "Get a Free Quote" (we use this ✓)
- High contrast against dark background
- Rounded/pill shape trending
- Subtle shadow + hover animation
- Single primary CTA per section (don't compete)

### Trust Signals

- **Client logos** (even 3-4 logos above the fold = major trust boost)
- **Testimonials with metrics** ("boosted conversion by over a third" — we have this ✓)
- **Security badges** (SOC 2, GDPR, ISO — we claim SOC 2 ✓)
- **Case studies** (we DON'T have these yet — HIGH PRIORITY to add)
- **"Trusted by X customers"** or "X projects delivered" (we show stats ✓)
- **Named testimonials** with photo, name, title, company (we have 1 ✓, need more)

### Pricing Page

- Tiered pricing works for self-serve
- For managed services like ours: "Custom quote" + starting-at price + tier comparison
- Include FAQ on pricing page (we have FAQ on home but not pricing-specific)
- Show ROI calculator: "3D menus increase orders by 25% — calculate your ROI"

---

## 4. Pages We're MISSING (High-Impact Additions)

### Must-Have (HIGH priority)

1. **Case Studies page** — real client stories with metrics (Domino's +18% ROI, Bareburger +25% dessert sales)
2. **Blog / Knowledge Base** — SEO content, thought leadership, industry news
3. **Comparison pages** — "Managed Capture 3D vs DIY scanning" / "vs Matterport" / "vs AR Code"
4. **ROI Calculator** — interactive tool: enter restaurant size → see projected revenue increase
5. **About Us / Team page** — builds trust, humanizes the brand

### Should-Have (MEDIUM priority)

6. **Partners / Integrations page** — show POS integrations, embed compatibility
7. **API Documentation** — for technical customers who want to embed/integrate
8. **Portfolio / Before-After Gallery** — interactive before/after slider with real captures
9. **Demo booking page** — Calendly-style scheduling (currently just form)

### Nice-to-Have (LOWER priority)

10. **Status page** — shows platform uptime, builds enterprise trust
11. **Changelog / What's New** — public product updates
12. **Resources / Downloads** — whitepapers, guides, marketing materials for clients

---

## 5. SEO Strategy (2025-2026)

### Core Web Vitals Targets

| Metric                         | Target     | Our Status                              |
| ------------------------------ | ---------- | --------------------------------------- |
| LCP (Largest Contentful Paint) | <2.5s      | Need to measure                         |
| FID (First Input Delay)        | <100ms     | Need to measure                         |
| CLS (Cumulative Layout Shift)  | <0.1       | Need to measure                         |
| Page load time                 | <2 seconds | Build is 4.4s — need to measure runtime |

### Content Strategy

- Blog posts: "How 3D menus increase restaurant revenue" / "Photogrammetry vs LiDAR for food" / etc.
- Target long-tail keywords: "3D restaurant menu service EU" / "AR food menu cost" / etc.
- Local SEO per market: "3D capture service [city]" pages
- Schema markup: we have Organization + WebSite ✓, need FAQ + LocalBusiness + Product

### Multi-Country SEO

- Separate landing pages per country/language
- hreflang tags for multi-language
- Country-specific content (local case studies, local pricing currency)
- Google Business Profile per market

---

## 6. Performance Best Practices for 3D Web

### 3D Model Loading

- Progressive loading: low-poly placeholder → full model (critical for mobile)
- Draco compression for meshes (reduces file size 90%+)
- KTX2 texture compression
- Lazy load 3D viewers (only when in viewport)
- model-viewer already handles most of this ✓

### WebGPU (NEW — 2026)

- Full cross-browser support as of January 2026 (Firefox, Safari, Chrome)
- **15-30x performance improvement** over WebGL for compute/rendering
- 70% of users now have WebGPU support
- Progressive enhancement: WebGPU primary, WebGL fallback
- Babylon.js Snapshot Rendering: 10x faster scenes with GPU Render Bundles
- **Our opportunity**: Be early adopter of WebGPU-powered 3D viewer = faster, smoother than any competitor

### Image Optimization

- WebP/AVIF for all images
- Responsive images with srcset
- Lazy loading for below-fold images
- CDN delivery (Netlify handles this ✓)

---

## 7. Best-in-Class Websites to Study

| Company         | What to Learn                                        | URL            |
| --------------- | ---------------------------------------------------- | -------------- |
| **Stripe**      | Dark theme, clear value prop, developer trust        | stripe.com     |
| **Linear**      | Minimal premium dark UI, speed, micro-animations     | linear.app     |
| **Vercel**      | Dark theme, gradient accents, technical credibility  | vercel.com     |
| **Notion**      | Product-led hero, interactive demo                   | notion.so      |
| **Figma**       | Interactive demos, community-driven                  | figma.com      |
| **Matterport**  | 3D demo above fold, pricing page                     | matterport.com |
| **Polycam**     | Gallery of real captures, trust building             | poly.cam       |
| **Databox**     | Balance of UX, creativity, brand identity            | databox.com    |
| **Flotorch**    | Dark theme with gradients, interactive product demos | flotorch.com   |
| **Chili Piper** | Conversion-optimized, clear CTA hierarchy            | chilipiper.com |

---

## 8. Actionable Quick Wins for Our Website

1. ✅ Already good: Dark theme, hero with 3D viewer, stats strip, FAQ, scroll animations
2. 🔴 Fix: Hero CTA says "Start a Request" — should be "Get a Free Quote" per CLAUDE.md
3. 🔴 Fix: Testimonial header says "What our clients say" (plural) — only 1 testimonial
4. 🟡 Add: Client logos strip above the fold
5. 🟡 Add: More testimonials (aim for 3-5)
6. 🟡 Add: Case studies page with real metrics
7. 🟡 Add: ROI calculator on pricing page
8. 🟡 Add: Blog / knowledge base for SEO
9. 🟡 Add: Comparison landing pages for paid search
10. 🟡 Improve: Request form — reduce to 5 fields max, add multi-step
