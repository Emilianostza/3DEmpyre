# Design: Add 3 Industry Landing Pages

**Date:** 2026-02-22
**Status:** Approved
**Approach:** Extend existing pattern (Approach A)

## Summary

Add three new industry vertical pages to the Managed Capture 3D marketing site: **Hospitality**, **Retail/E-commerce**, and **Real Estate**. Each reuses the existing `Industry.tsx` dynamic template with industry-specific content. Navigation gets an "Industries" dropdown replacing the single "Restaurants" link.

## New Industries

### Hospitality (`/industries/hospitality`)

- **Title:** "Immersive 3D tours that book rooms before guests arrive"
- **Subtitle:** "We capture your hotel rooms, lobbies, and amenities — delivering web-ready 3D tours and AR experiences that let guests explore before they book."
- **Outcomes:**
  1. Increase bookings with virtual room walkthroughs
  2. Showcase amenities, lobbies, and event spaces in 3D
  3. Reduce no-shows by setting accurate guest expectations
- **Permissions:** Edit descriptions, create share links, generate QR codes, download bundles
- **Gallery samples:** Hotel Suite, Resort Pool, Lobby Lounge, Conference Room, Spa Treatment Room, Restaurant Terrace
- **FAQ:** Capture time, guest disruption

### Retail / E-commerce (`/industries/retail`)

- **Title:** "Product 3D that doubles conversion rates"
- **Subtitle:** "We capture your products in photorealistic 3D — delivering interactive models that replace flat photography and reduce returns."
- **Outcomes:**
  1. Double online conversion with interactive 3D product views
  2. Reduce returns by giving customers accurate product previews
  3. Generate AR try-before-you-buy experiences from one capture session
- **Permissions:** Edit metadata, create share links, embed codes, download bundles
- **Gallery samples:** Designer Sneaker, Leather Handbag, Smart Watch, Armchair, Ceramic Vase, Sunglasses
- **FAQ:** Product sizes supported, turnaround time

### Real Estate (`/industries/real-estate`)

- **Title:** "Property tours that sell homes before the first visit"
- **Subtitle:** "We capture entire properties in 3D — delivering virtual walkthroughs, floor plans, and AR staging that attract buyers worldwide."
- **Outcomes:**
  1. Get 133% more listing views with 3D virtual tours
  2. Attract international buyers who can't visit in person
  3. Reduce time-on-market with immersive property previews
- **Permissions:** Edit descriptions, create share links, generate QR codes, download bundles
- **Gallery samples:** Modern Living Room, Kitchen Interior, Master Bedroom, Penthouse Terrace, Office Space, Retail Storefront
- **FAQ:** Property size limits, outdoor captures

## Navigation Changes

Replace single "Restaurants" nav link with "Industries" dropdown:

```
Industries v
+-- Restaurants    -> /industries/restaurants
+-- Hospitality    -> /industries/hospitality
+-- Retail         -> /industries/retail
+-- Real Estate    -> /industries/real-estate
```

- **Desktop:** Hover/click dropdown with icon + label per industry
- **Mobile:** Expandable accordion group under "Industries"
- **Footer:** "Industries" section lists all 4 links

## i18n

All copy in the `industry.*` namespace across all 4 locales (en, de, es, ru). Keys follow existing pattern:

- `industry.hospitality.title`, `industry.hospitality.subtitle`
- `industry.hospitality.outcomes.1`, `.2`, `.3`
- `industry.hospitality.permissions.1` through `.4`
- `industry.hospitality.samples.1.name`, `.tag`
- `industry.hospitality.faq1.q`, `.a`

Same structure for `retail` and `realEstate`.

## Types & Constants

- Add `Hospitality`, `Retail`, `RealEstate` to `Industry` enum in `types.ts`
- Add 3 `IndustryConfig` entries in `constants.tsx`
- Update `NAV_ITEMS` to use dropdown structure
- Update `RequestForm.tsx` Step 1: 4 industry buttons instead of 2

## Files Changed

| File                                 | Change                                         |
| ------------------------------------ | ---------------------------------------------- |
| `src/types.ts`                       | Add 3 Industry enum values                     |
| `src/constants.tsx`                  | Add 3 IndustryConfig objects, update NAV_ITEMS |
| `src/components/Layout.tsx`          | Industries dropdown header + footer links      |
| `src/pages/RequestForm.tsx`          | 4 industry buttons in Step 1                   |
| `public/locales/en/translation.json` | Add industry i18n keys                         |
| `public/locales/de/translation.json` | Add translated keys                            |
| `public/locales/es/translation.json` | Add translated keys                            |
| `public/locales/ru/translation.json` | Add translated keys                            |

No new page components needed. `Industry.tsx` + dynamic routing handles all 4.

## Future Work (Not In Scope)

- Industry-specific portal identities (logged-in dashboard adapts to customer's industry)
- Custom sections per industry (Approach C evolution)
- Real asset images replacing SVG placeholders

## Research Sources

- Hotel renovation 3D capture: GP Radar case studies
- Hospitality tech trends 2026: Canary Technologies
- 3D e-commerce conversion: Photorobot, Zolak (94% increase)
- ROI of 3D visuals: VividWorks
- Real estate 3D tours: Matterport, Realsee (133% more views)
- Photogrammetry for marketing: VNTANA
