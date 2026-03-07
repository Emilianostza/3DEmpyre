# Market Expansion — Research

> Updated: 2026-02-20
> Sources cited inline

## Current Markets

- 🇪🇪 Estonia
- 🇬🇷 Greece
- 🇫🇷 France

---

## 1. Russia Market Entry (1-2 year timeline)

### Market Size & Opportunity

- Russian AR/VR market: ~6-7 billion rubles by 2025 (~$65-75M), growing 30-40% annually
- Still early stage — impressive dynamics but nascent adoption
- Tourism/museums actively adopting AR (AR recreations of ancient structures)
- E-commerce growing rapidly (online food delivery, digital services)

### Payment Systems (NOT Stripe — doesn't work in Russia)

| Provider                           | Notes                                     |
| ---------------------------------- | ----------------------------------------- |
| **YooKassa** (Sberbank)            | Most popular, plugins for major platforms |
| **CloudPayments**                  | Good API, modern developer experience     |
| **Robokassa**                      | Wide payment method support               |
| **Tinkoff Payments**               | Growing rapidly, good UX                  |
| **SBP (Система быстрых платежей)** | National instant payment system           |

**RECOMMENDATION**: YooKassa as primary + Tinkoff as secondary

### Data Localization (CRITICAL)

- **Federal Law 152**: Personal data of Russian citizens MUST be stored on servers located in Russia
- **As of July 1, 2025**: ALL personal data must be stored ONLY on domestic platforms
- **Implication**: Need Russian hosting provider (Yandex Cloud, VK Cloud, Selectel)
- Cannot use Supabase/Netlify for Russian user data
- Options:
  - Russian VPS/cloud for RU user data + Supabase for EU data (split architecture)
  - Or self-hosted Supabase on Russian infrastructure

### Legal & Sanctions

- Increasing cybersecurity and data privacy requirements
- Need to research current sanctions landscape carefully
- May need local legal entity or partner
- Currency controls affect international payments
- **TODO**: Consult with legal advisor specializing in Russia tech operations

### Language & Localization

- Russian language is essential (English-only won't work)
- Cyrillic text throughout entire UI
- Right-to-left is NOT needed (Russian is left-to-right)
- Cultural differences: more formal B2B communication style
- Local payment terms may differ (longer net terms common)

### Restaurant Tech in Russia

- Food delivery market is massive (Yandex Eats, Delivery Club)
- Digital menu adoption growing, especially in Moscow/St. Petersburg
- QR code menus became widespread during COVID
- AR menus = next logical step

### RECOMMENDATION

**Phase approach**:

1. First: localize website to Russian (6 months before entry)
2. Second: set up Russian hosting infrastructure (data localization)
3. Third: integrate YooKassa + Tinkoff payment
4. Fourth: soft launch in Moscow (highest restaurant density, most tech-forward)
5. Fifth: expand to St. Petersburg, then regional cities

---

## 2. EU Expansion (Next Best Markets)

### Market Sizing: EU 3D Scanning Market

- **Total EU market**: $2.01B (2025) → $5.82B by 2033 (14.22% CAGR)
- 86% of restaurant operators consider technology adoption "extremely important"

### Priority EU Markets

#### 🇩🇪 Germany (HIGH PRIORITY)

- Largest EU economy, strong industrial base
- High restaurant density, especially in Berlin, Munich, Hamburg
- Strong digital adoption
- Direct flights from current markets (Estonia, France)
- German-language localization needed
- Payment: SEPA, PayPal, Klarna popular
- **Challenge**: High quality expectations (aligns with our quality focus)

#### 🇪🇸 Spain (HIGH PRIORITY)

- Tourism-driven economy = restaurants are critical
- High smartphone penetration
- Growing digital menu adoption
- Barcelona and Madrid = tech hubs
- Spanish-language localization needed
- Payment: Cards, Bizum (local mobile payment)
- **Challenge**: Price sensitivity, longer sales cycles

#### 🇮🇹 Italy (MEDIUM PRIORITY)

- Restaurant culture is central to Italian identity
- Tourism drives restaurant revenue
- Growing tech adoption but slower than Germany/Spain
- Italian-language localization needed
- Payment: Cards, Satispay (local mobile payment)
- **Challenge**: Fragmented restaurant market, many small family businesses

#### 🇳🇱 Netherlands (MEDIUM PRIORITY)

- High digital adoption, English widely spoken
- Smaller market but tech-forward
- Good logistics hub for Northern Europe
- Payment: iDEAL (dominant local payment)
- **Advantage**: Can serve in English initially

#### 🇵🇱 Poland (CONSIDER)

- Growing tech hub, competitive costs
- Could be good for Eastern EU coverage
- Payment: BLIK (dominant mobile payment)

### RECOMMENDATION: Expansion Order

1. **Germany** (largest market, highest willingness to pay for quality)
2. **Spain** (tourism = restaurants = demand)
3. **Netherlands** (easy entry, English-friendly, good logistics)
4. **Italy** (cultural fit but slower adoption)

---

## 3. Vertical Expansion (Beyond Restaurants)

### Tier 1 — High Demand, High Willingness to Pay

| Vertical                        | Use Case                            | Market Signal                                       |
| ------------------------------- | ----------------------------------- | --------------------------------------------------- |
| **Retail / E-commerce**         | Product 3D for online stores        | Shopify 3D, Amazon 3D already exist — demand proven |
| **Real Estate**                 | Property staging, virtual furniture | Matterport proved $5B+ market                       |
| **Museums & Cultural Heritage** | 3D digitization of artifacts        | EU funding available, UNESCO interest               |

### Tier 2 — Good Demand, Needs Specific Expertise

| Vertical                        | Use Case                     | Notes                             |
| ------------------------------- | ---------------------------- | --------------------------------- |
| **Automotive**                  | Parts catalog, showroom 3D   | High ticket, long sales cycles    |
| **Architecture & Construction** | As-built documentation       | LiDAR-centric, not photogrammetry |
| **Healthcare**                  | Prosthetics, dental, devices | Regulatory requirements (MDR)     |

### Tier 3 — Niche/Future

| Vertical            | Use Case                  | Notes                          |
| ------------------- | ------------------------- | ------------------------------ |
| **Education**       | 3D learning materials     | Low budget but high volume     |
| **Insurance**       | Damage documentation      | Growing demand for 3D evidence |
| **Legal/Forensics** | Crime scene documentation | Specialized, lucrative niche   |

### RECOMMENDATION

**Expand to Retail/E-commerce first** — same capture technology, different customer.
Then Museums (EU funding grants available). Then Real Estate (need LiDAR addition).

---

## 4. Localization Strategy

### Multi-Language Website Approach

- Use i18n library (react-intl or react-i18next)
- URL structure: managedcapture3d.com/de/, /es/, /ru/, etc.
- Store translations in JSON files per language
- hreflang tags for SEO
- Automatic language detection based on browser settings + manual toggle

### Currency Handling

| Market       | Currency | Symbol |
| ------------ | -------- | ------ |
| EU (current) | EUR      | €      |
| Russia       | RUB      | ₽      |
| UK (future)  | GBP      | £      |

### Cultural Considerations

- **Germany**: Precise, formal, detail-oriented — emphasize accuracy and specifications
- **Spain**: Relationship-driven — emphasize personal service, local team
- **Russia**: Status-conscious — emphasize premium quality, exclusivity
- **Italy**: Design-conscious — emphasize aesthetics, visual quality

### Local SEO

- Google Business Profile per city/market
- Local landing pages: "3D capture service in [city]"
- Local case studies and testimonials
- Country-specific blog content

---

## 5. Logistics & Operations

### Technician Management

- Mobile app for technician scheduling and dispatch (future build or integrate)
- GPS tracking for on-site visits
- Standard capture protocol (SOPs for consistent quality across teams)
- Equipment tracking and maintenance schedule

### Equipment

- Camera kits: DSLR/mirrorless + turntable + lighting rig
- Portable: must fit in carry-on or small van
- Standard kit per technician (~$3-5K estimated equipment cost)
- LiDAR scanner for future space capture vertical (~$10-30K)

### Quality Control

- Automated QC pipeline (AI checks for: completeness, texture quality, geometry issues)
- Sample-based human QC for flagged assets
- Per-technician quality scoring (track and improve over time)
- Client feedback loop → quality improvement

---

## WARNINGS & RISKS

### Russia Entry Risks

- Sanctions landscape is complex and changing — legal review ESSENTIAL
- Data localization adds infrastructure complexity and cost
- Currency volatility (RUB) affects pricing stability
- Political risk — could affect business continuity
- Payment processing for cross-border transactions is complex

### EU Expansion Risks

- Each country = different language, culture, business norms
- GDPR compliance is table stakes but implementation varies by country
- Local competition may have first-mover advantage
- Hiring/managing local technicians across borders = HR complexity

### General Expansion Risks

- Stretching too thin across too many markets simultaneously
- Quality control becomes harder with distance
- Cash burn increases with each new market
- Brand/marketing needs differ per culture
