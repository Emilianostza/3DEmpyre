# 3D Templates, Menus & Interactive Experiences — Research

> Last updated: 2026-03-06
> Purpose: capture practical research and product ideas for templates, interactive experiences, embeds, QR flows, and future-facing 3D presentation features.
> Use this file as research context, not as a default execution checklist.

---

## Working Interpretation

This file contains valuable research and idea generation, but not everything here should be treated as an immediate build priority.

For current sessions:
- public website quality and conversion work come first
- template and interaction work should support real business goals
- advanced future-facing ideas should not distract from immediate UX, trust, and lead-generation improvements

When deciding what to build, prefer:
1. proven commercial value
2. fit with current business direction
3. implementation practicality
4. maintainability
5. clear user benefit

---

## 1. 3D Food Menu — Commercial Impact Signals

These figures are directional research inputs, not guaranteed project outcomes.

| Example / Category | Reported Result |
|---|---:|
| Bareburger + Kabaq (AR desserts) | +25% dessert sales |
| Domino's UK (Snapchat AR) | +18% ROI, -50% cost-per-order |
| Panera Bread (AR campaign) | 9.3M users reached, 25% visited store |
| Photo menus (general) | +15% sales uplift |
| Digital ordering (general) | +30% higher check averages |
| AR/VR market projection | $200B+ by 2032, 34% CAGR |

### Practical takeaway

AR and 3D menu experiences may drive measurable business value when:
- the 3D content quality is strong
- the experience is fast and easy to access
- the restaurant context makes visual presentation matter
- the workflow fits how customers actually browse and order

### Caution

Do not assume that “3D” alone creates value.
Weak assets, slow load times, or gimmicky presentation can reduce trust instead of increasing sales.

---

## 2. Current Template Stack

### Current capabilities

- Restaurant menu template with `model-viewer` (3D + AR)
- QR code generation for table tents
- AR support via iOS Quick Look and Android Scene Viewer
- 3D editor for model presentation
- Menu settings: brand colors, fonts, currency customization

### What appears strongest right now

- `model-viewer` integration — mature and practical
- QR-to-AR flow — easy for restaurants to use
- dark premium visual direction — aligned with current brand positioning

### Current limitation

The strongest opportunity is not only more template quantity.
It is stronger polish, stronger proof, better performance, better conversion support, and better real-world deployability.

---

## 3. Template Ideas to Add

These are grouped by commercial relevance and current business fit.

### Priority 1 — Restaurant Templates

1. **Multi-category menu**
   - tabs/sections for starters, mains, desserts, drinks
   - commercially practical and directly aligned with the current core market

2. **Daily specials template**
   - rotating featured items
   - strong short-term promotional value

3. **Chef’s table experience**
   - premium single-dish showcase with story, ingredients, and presentation
   - good for higher-end restaurants and premium positioning

4. **Combo / set menu template**
   - presents multiple items together
   - useful for upsells and bundled offers

5. **Dietary filter template**
   - vegan, vegetarian, gluten-free, allergens
   - strong usability and accessibility value

6. **Multi-language menu**
   - same 3D models, switchable text
   - especially important for tourist-heavy markets

### Priority 2 — Retail / E-commerce Templates

7. **Product showcase**
   - single product hero with 360° interaction
   - strong fit for retail expansion

8. **Product catalog grid**
   - browse multiple products with quick 3D preview
   - practical for larger inventory showcases

9. **Product configurator**
   - color/material/size switching
   - high-value but more complex

10. **Before / After comparison**
   - original vs processed/captured presentation
   - useful both for clients and for internal marketing

### Priority 3 — Other Vertical Templates

11. **Museum artifact viewer**
   - educational annotations, zoom detail, context panels

12. **Real estate room tour**
   - relevant only if room/space capture becomes a real vertical priority

13. **Automotive parts viewer**
   - exploded view, part information, technical metadata

14. **Portfolio / gallery template**
   - showcase best work for sales and trust-building
   - especially useful for the company’s own marketing

### Practical prioritization note

Do not build every template because it sounds exciting.
Prefer templates that:
- support current markets
- improve close-rate or proof
- can be demoed credibly
- are realistic to maintain

---

## 4. Interactive 3D Viewer Improvements

### `model-viewer` capabilities worth using well

- `poster` — image shown before model load
- `loading="lazy"` — defer offscreen loading
- `auto-rotate`
- `camera-controls`
- `ar`
- `environment-image`
- `tone-mapping`
- `shadow-intensity`
- `animation`
- `variant`

### Practical loading strategy

1. show optimized poster immediately
2. load lightweight preview / lower-cost first state
3. load richer/full asset after initial experience is stable
4. compress aggressively where possible
5. avoid making the first interaction feel slow or fragile

### Progressive loading concept

Preferred direction:
- poster image first
- lightweight preview second
- full-quality model after readiness

This is especially important if future real assets become heavy.

### Compression / asset strategy

- Draco mesh compression
- KTX2 textures
- optimized poster images
- explicit size budgeting for production assets

### Practical rule

Viewer sophistication should not outpace reliability.
A fast, stable viewer is better than a technically impressive but fragile one.

---

## 5. WebGPU, Three.js, and Advanced Rendering

### WebGPU direction

WebGPU is strategically important and worth continued monitoring.
Potential advantages:
- much better rendering performance
- better future fit for advanced rendering
- possible real-time Gaussian Splat support

### Three.js / React Three Fiber

Advantages:
- more control
- custom interactions and effects
- better path for specialized rendering and future 3DGS work

Tradeoffs:
- more complexity
- larger implementation burden
- potentially larger bundle and more maintenance cost

### Current decision implication

For most standard templates, keep `model-viewer`.
Use Three.js / R3F only where advanced features genuinely require it.

### Practical rule

Do not replace simple reliable flows with a more complex viewer stack unless the business benefit is clear.

---

## 6. QR Code Strategy

### Current baseline

- basic QR codes already supported

### High-value improvements

1. **Branded QR codes**
   - restaurant/client logo in center
   - stronger trust and better presentation

2. **Dynamic QR codes**
   - redirect destination can change without reprinting
   - strong practical value

3. **QR analytics dashboard**
   - scans by time, location, device, repeat rate
   - valuable for client reporting

4. **NFC tags**
   - useful later, but not a core current requirement

5. **QR with visual context**
   - small nearby product/menu image for clarity

6. **Multi-format export**
   - SVG, PNG, PDF, multiple print sizes

### QR analytics worth offering clients

- total scans
- unique vs repeat visitors
- peak scan times
- device split
- most-viewed items
- average session duration
- downstream conversion where measurable

### Practical note

QR features are strongest when they are:
- easy to print
- easy to understand
- clearly measurable
- tied to client outcomes

---

## 7. Embeddable Widget Strategy

### Embed options

1. **iframe embed**
   - broadest compatibility
   - easiest default option

2. **Web component**
   - flexible for many sites
   - useful for technical clients

3. **React component**
   - better for React-based client sites

4. **Platform integrations**
   - Shopify
   - WordPress
   - other major site builders later

### White-label opportunities

- remove MC3D branding
- custom loading screen
- custom theme colors
- client-specific domain/path

### Analytics worth tracking in embeds

- loads
- rotates / zooms / interactions
- AR activations
- time spent
- most-engaged assets
- conversion events where available

### Practical rule

Embed strategy should prioritize ease of adoption first.
The simplest reliable embed usually creates more value than the most customizable one.

---

## 8. Automation in Menu / Template Creation

### Promising automation ideas

1. **Auto-layout**
   - detect item counts and arrange sections intelligently

2. **AI descriptions**
   - generate draft descriptions from model + item metadata
   - requires human review for quality

3. **Auto-pricing sync**
   - sync prices from POS systems

4. **Auto-translation**
   - translation API for menu content
   - useful, but quality control matters

5. **Auto-thumbnail generation**
   - render a preferred angle for 2D thumbnails

6. **Auto-QR generation**
   - generate QR assets per item/category

7. **Auto-publish**
   - approved models flow directly into live experiences

### Practical rule

Automation is strongest when it reduces repetitive setup work without lowering trust or quality.

---

## 9. POS Integration Priority

| POS System | Market Fit | Priority |
|---|---|---|
| Square | US / EU | High |
| Lightspeed | EU / US | High |
| Toast | US | Medium |
| iiko | Russia | High for RU market |
| Poster POS | EU / RU | Medium |

### Practical note

POS integration is strategically strong, but should not be treated as immediate default work unless the business is ready to support it operationally.

---

## 10. What Looks Most Valuable Next

### Nearer-term valuable directions

- better restaurant template polish
- stronger multi-language menu support
- stronger portfolio/gallery presentation for sales
- better QR branding and analytics
- stronger embed experience
- performance-aware viewer improvements
- templates that support current sales motion

### Medium-term opportunities

- product showcase / retail templates
- better configurator experiences
- POS-connected menu automation
- stronger embed analytics and white-labeling

### Longer-term experimental directions

- WebGPU-native viewer work
- Gaussian Splat browser experiences
- Vision Pro / spatial experiences
- AI-enhanced 3D workflows
- social-media-ready 3D outputs

---

## 11. Future Trend Watchlist (2026–2027)

These are worth monitoring, but should not automatically become execution priorities.

### Spatial computing / Vision Pro

Potential:
- spatial menu experiences
- immersive presentation
- early-mover brand advantage

Risk:
- niche usage, uncertain near-term demand

### WebGPU era

Potential:
- better rendering performance
- better support for advanced 3D experiences
- future browser-side AI/rendering workflows

Risk:
- implementation complexity
- not every business problem requires it yet

### AI-enhanced 3D

Potential:
- texture upscaling
- relighting
- background replacement
- artifact detection / quality scoring

Risk:
- uneven quality
- risk of overpromising

### Social media integration

Potential:
- Instagram / TikTok / social-ready deliverables
- stronger client value perception
- wider distribution

Risk:
- added production complexity without guaranteed ROI

### Voice / gesture interfaces

Potential:
- accessibility improvements
- novel interaction formats

Risk:
- likely low current priority relative to mainstream web UX improvements

---

## 12. Commercial Reality Checks

Before committing to a new template or experience, ask:

1. Does this help the current business sell?
2. Does this improve trust, conversion, or retention?
3. Can it be shown with genuinely good content?
4. Can it be maintained without excessive complexity?
5. Is it better than improving the current public website first?

If the answer is weak, do not treat it as an immediate priority.

---

## 13. Current Working Recommendation

For the current business stage, the strongest practical template priorities appear to be:

1. restaurant-first improvements
2. multi-language menu support
3. portfolio / showcase experiences that improve trust and sales
4. branded QR and analytics improvements
5. simple strong embed tools
6. only selective expansion into more advanced rendering where the use case is clear

---

## 14. Maintenance Rule

When a template idea becomes:
- implemented,
- deprioritized,
- commercially disproven,
- or replaced by a better approach,

update this file so it remains a useful research reference rather than an idea dump.