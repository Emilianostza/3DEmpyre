# Claude Workspace — Managed Capture 3D Platform

> Last updated: 2026-03-07
> Project root: C:\Users\emili\Downloads\New folder\test

## Current State

Production React 19 + Vite 6 + Tailwind CSS 3 SPA for a managed 3D capture service serving restaurants and enterprises.

The public website is the current primary focus. Main CTA flow routes users to `/request` for a free quote. Core architecture is stable. Supabase integration is partially complete, and provider-based mock/real data switching still exists in some areas.

Current stack and architecture are already strong enough for iterative improvement rather than broad rewrites.

## Active Priorities

1. Improve public-facing UX/UI quality
2. Find and fix high-impact bugs and friction
3. Improve mobile responsiveness
4. Improve accessibility and trust signals
5. Complete Supabase integration
6. Increase test coverage to required thresholds
7. Run Lighthouse / Core Web Vitals optimization
8. Strengthen SEO and conversion performance

## Known Blockers

- ~~JWT still uses localStorage instead of HttpOnly cookies~~ — RESOLVED (Session 26, pending deployed verification)
- Some areas still rely on mock providers instead of full Supabase-backed data
- Lighthouse / Core Web Vitals audit is not yet complete
- Test coverage target has not yet been reached
- CI/CD with GitHub Actions is not fully set up

## Purpose

This workspace stores research, plans, changelogs, session notes, decisions, and open questions so work can continue across sessions without losing context.

Use this workspace to:
- preserve continuity
- avoid repeated research
- document decisions and tradeoffs
- track what changed and why
- keep priorities aligned with business goals

## Required Reading Order

Before starting any non-trivial task, read in this order:

1. `INDEX.md`
2. Relevant file(s) from `plans/`
3. `notes/DECISIONS.md`
4. `notes/WARNINGS-AND-PITFALLS.md` if present and relevant
5. `notes/SESSION-LOG.md` for recent work
6. `changelog/CHANGELOG.md` if the task relates to recent implementation history

Do not begin broad implementation before understanding the current plan and constraints.

## Folder Structure

```text
.claude/workspace/
  INDEX.md                        ← Master index and current project snapshot
  research/
    capture-tech/                 ← 3D scanning tech: photogrammetry, LiDAR, NeRF, Gaussian Splatting, etc.
    competition/                  ← Competitor analysis, positioning, benchmarks
    markets/                      ← Market expansion: EU, Russia, verticals beyond restaurants
    web-ux-trends/                ← Web design, UX, CRO, SaaS and enterprise site trends
    3d-templates/                 ← Menu templates, 3D viewer ideas, embeddable experiences
  plans/
    MASTER-PLAN.md                ← Main phased roadmap; default source of truth for direction
    public-pages.md               ← Public-facing pages, landing pages, conversion improvements
    employee-portal.md            ← Internal tools and operations dashboard plan
    customer-portal.md            ← Client dashboard and customer-facing product plan
    editor-templates.md           ← 3D editor, menu builder, template roadmap
  changelog/
    CHANGELOG.md                  ← Running implementation log with dates
  notes/
    SESSION-LOG.md                ← Per-session summary of work completed
    DECISIONS.md                  ← Architectural, UX, and business decisions with reasoning
    QUESTIONS.md                  ← Open questions, unresolved items, follow-ups
    WARNINGS-AND-PITFALLS.md      ← Known traps, fragile areas, mistakes to avoid