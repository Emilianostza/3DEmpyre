# Open Questions

> Open items, follow-ups, and things worth clarifying when the timing is right.
> Keep this list practical. Do not interrupt current high-priority website work with low-value questions.

## Status Rule

When deciding whether to ask something now or later:

- ask now only if it blocks current work
- defer if the answer is useful but not required yet
- mark as answered once the user has clearly decided

Latest direct user instruction overrides older assumptions.

---

## Answered

- [x] Workspace location → `.claude/` folder
- [x] Russia / market timeline → 1–2 years
- [x] Capture technology direction → research and recommend
- [x] Priority order → public pages first
- [x] Full automation required long-term → yes
- [x] Managed service positioning → this is a managed capture service, not self-serve
- [x] Main public CTA direction → route users to `/request` for a free quote
- [x] Public website quality is the main current focus

---

## Ask Only If Blocking Current Work

- [ ] Do you have approved real client logos for the homepage/client-logo strip?
- [ ] Do you have approved testimonials that can be published publicly?
- [ ] Do you have real project images / renders / screenshots to replace placeholders on key marketing pages?
- [ ] Do you have final brand assets or logo variations that should be used consistently site-wide?
- [ ] What is the correct canonical domain everywhere: `managedcapture3d.com` or `managed3d.com`? Resolve this before further SEO/domain cleanup.
- [ ] Which pages, if any, are considered highest business priority beyond the homepage and `/request` flow?

---

## Useful Soon, But Not Urgent

### Conversion / Marketing

- [ ] What is the main conversion goal right now: more quote requests, higher-quality leads, enterprise trust, or SEO growth?
- [ ] Do you want the website to prioritize restaurants first in messaging, or present a broader enterprise/multi-vertical positioning now?
- [ ] Do you want stronger proof elements added later, such as client logos, case-study stats, trust counters, certifications, or guarantees?
- [ ] Which case studies are real and publishable versus placeholder/demo content?

### Content / Brand

- [ ] Is there a formal brand guideline document for fonts, colors, spacing, imagery, tone, and logo usage?
- [ ] What tone should public copy lean toward most: premium enterprise, futuristic/innovative, or practical ROI-focused?
- [ ] Are there approved claims that can be used confidently on public pages?
- [ ] Are there any claims that must be avoided for legal or trust reasons?

### Product / Operations

- [ ] What CMS or admin workflow should non-technical staff eventually use to update public content?
- [ ] Which parts of the platform must become fully real-data-driven first?
- [ ] Which internal workflows are most important once public-page work is in a good state?
- [ ] What is the preferred payment provider for non-Russia markets?
- [ ] Is there already a preferred approach for invoicing and billing automation?

### Technical / Security

- [ ] When should JWT migration from localStorage to HttpOnly cookies be scheduled?
- [ ] Are there any production monitoring or analytics tools already installed?
- [ ] Are Lighthouse / Core Web Vitals targets already being tracked anywhere?
- [ ] Is there a preferred CI/CD setup beyond GitHub Actions as a current default candidate?

### i18n / Markets

- [ ] Which languages should be considered highest priority in practical business terms, even though infrastructure exists for EN/DE/ES/RU?
- [ ] Which market should be operationally prioritized first after the current base markets?
- [ ] Are localized landing pages needed soon, or is current translated routing enough for now?
- [ ] Are there market-specific legal/compliance constraints that should affect website messaging?

### Business Context

- [ ] How many active clients and active projects currently exist?
- [ ] What is the current sales motion: founder-led, outbound, inbound, partner-led, or mixed?
- [ ] Is a mobile app actually planned, or is the product expected to stay web-first/web-only?
- [ ] Is the company structure expected to remain a single entity or expand into country-specific entities later?

---

## Parked for Later Strategic Review

These matter, but should not interrupt current website quality work unless explicitly requested.

- [ ] Budget for automated 3D processing pipeline and cloud GPU costs
- [ ] Build-vs-buy decision timing for photogrammetry / processing pipeline
- [ ] Russia legal/payment/infrastructure constraints in implementation detail
- [ ] White-label/custom-domain roadmap timing
- [ ] Shopify / WooCommerce / WordPress integration timing
- [ ] NFC tag support timing
- [ ] Spatial computing / Vision Pro timing
- [ ] AI enhancement roadmap priority

---

## Current Working Assumptions

Unless the user says otherwise, assume:

- the public-facing website is the main near-term focus
- current work should prioritize quality, trust, conversion, responsiveness, accessibility, and maintainability
- the business is a managed service, not self-serve
- CTA paths should drive users toward a free quote request
- long-range roadmap ideas should not distract from immediate website improvements

---

## Maintenance Rule

When an open question is answered:

1. move it to **Answered**
2. update any affected plan/decision/workspace file if needed
3. remove outdated assumptions that conflict with the new answer