# Key Decisions & Requirements

> Last updated: 2026-03-06

This file records durable project decisions, non-negotiable requirements, and important strategic constraints.

When a current user instruction conflicts with this file, prefer the latest direct user instruction. Otherwise, treat this file as a source of truth for how the project should be designed and prioritized.

---

## 1. Full Automation Is the Long-Term Core Requirement

**Date**: 2026-02-20  
**Decision**: The long-term platform workflow should be as automated as possible end-to-end.

### Definition

The intended long-term flow is:

- technician uploads raw photos to the website
- 3D model creation is automated
- processed model is uploaded to the correct customer project automatically
- quality checks are automated where practical, with human override if needed
- customer notification is automated
- payment/invoicing flow should become increasingly automated
- delivery/access to assets should become increasingly automated

### Constraint

For current sessions, this is a **strategic product requirement**, not a reason to deprioritize immediate website quality and conversion work unless the user explicitly asks to work on automation.

### Why

Scalability. A workflow that depends on repeated manual intervention will not scale cleanly across countries, customers, and higher project volume.

---

## 2. Quality Is the Primary Differentiator

**Date**: 2026-02-20  
**Decision**: Quality is the main differentiator against competitors.

### Implications

Everything should reflect premium quality:

- website presentation
- copy and messaging
- UI polish
- UX clarity
- capture output quality
- customer-facing deliverables
- operational workflows
- trust and enterprise credibility

### Working Standard

When choosing between “faster but weaker” and “slower but clearly better,” prefer the better result unless the cost is unreasonable.

---

## 3. Multi-Technology Capture Direction

**Date**: 2026-02-20  
**Decision**: The platform is not permanently limited to photogrammetry.

### Direction

Adopt the best capture technology as it matures and becomes practically useful for the business.

Potential areas of interest include:

- photogrammetry
- Gaussian Splatting
- NeRF-related methods
- LiDAR
- structured light
- other high-quality 3D capture methods

### Constraint

Do not assume newer capture technology should be implemented immediately. Research and practicality come before adoption.

---

## 4. Market Expansion Beyond Current EU Presence

**Date**: 2026-02-20  
**Decision**: The business intends to expand beyond current markets.

### Current market context

The project already thinks in terms of:
- Estonia
- Greece
- France

### Expansion direction

Within a 1–2 year horizon, expansion may include:
- Russia
- additional EU markets
- additional global markets where the model is commercially strong

### Constraint

Expansion planning is important, but should not distract from current website quality, conversion, and product execution unless explicitly requested.

---

## 5. Expansion Beyond Restaurants

**Date**: 2026-02-20  
**Decision**: The business is not limited to restaurants.

### Target verticals may include

- retail
- enterprise
- real estate
- automotive
- museums
- other high-value visual commerce or presentation use cases

### Constraint

Restaurants remain the most immediate and concrete focus unless the user explicitly shifts attention to another vertical.

---

## 6. Public-Facing Pages Come First

**Date**: 2026-02-20  
**Decision**: Public-facing website work is the top immediate priority.

### Priority order

1. public-facing pages
2. conversion and lead generation
3. brand trust and presentation quality
4. SEO and discoverability
5. internal tools and deeper platform surfaces afterward

### Implication

For most current sessions, the default working assumption should be:
- improve public pages first
- reduce friction
- strengthen trust
- improve responsiveness and accessibility
- preserve maintainability

---

## 7. Strategic vs Immediate Work Must Stay Separated

**Date**: 2026-03-06  
**Decision**: Long-range product vision must not override current practical priorities.

### Immediate default priorities

Unless explicitly directed otherwise, current sessions should bias toward:

- website UX/UI quality
- conversion improvements
- responsiveness
- accessibility
- trust signals
- SEO basics
- technical stability
- maintainability

### Strategic items that are not default execution targets

These are important, but not default session targets unless the user asks:
- deep automation pipeline work
- advanced future capture-tech implementation
- long-range international expansion work
- speculative platform features
- ambitious rewrites without clear need

---

## 8. Premium Positioning Must Stay Visible

**Date**: 2026-03-06  
**Decision**: The brand should consistently feel premium, modern, and high-trust.

### This affects

- visual design decisions
- spacing and typography discipline
- copywriting tone
- CTA placement and wording
- page hierarchy
- trust signal placement
- how enterprise readiness is presented

### Avoid

- generic SaaS fluff
- weak or vague CTA copy
- crowded layouts
- low-trust presentation
- inconsistent interface quality

---

## 9. Managed Service Positioning Must Remain Clear

**Date**: 2026-03-06  
**Decision**: The business is a managed capture service, not a self-serve capture platform.

### Implications

Messaging should stay aligned with:
- managed service
- guided workflow
- premium execution
- quote/request flow rather than self-serve signup

### Avoid

- wording that implies instant self-serve capture onboarding
- “sign up and do everything yourself” positioning unless explicitly requested

---

## 10. Decision Handling Rule

**Date**: 2026-03-06  
**Decision**: When decisions conflict, use this order of precedence:

1. latest direct user instruction
2. current project constraints in `CLAUDE.md`
3. current workspace context in `INDEX.md`
4. this decisions file
5. older plans and notes

This prevents stale strategic notes from overriding current execution needs.