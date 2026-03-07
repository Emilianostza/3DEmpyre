# Warnings, Pitfalls & What Doesn't Work

> Last updated: 2026-03-06
> This file records failed approaches, risky assumptions, fragile areas, known traps, and things that should not be over-trusted.

Use this file to avoid repeating mistakes, overcommitting to weak ideas, or letting strategic hype distract from current practical priorities.

When a current user instruction conflicts with this file, prefer the latest direct user instruction.

---

## Working Rule

Do not let long-range product excitement override current practical execution.

For most current sessions, the main risks are:
- losing focus on the public website
- making broad rewrites without proof
- trusting speculative claims too quickly
- overvaluing future tech while current UX/conversion issues remain
- treating background-agent output as truth without verification

---

## 1. Technology Pitfalls

### 1.1 Pure NeRF is not the default bet

- Gaussian Splatting is more practical for real-time rendering
- Pure NeRF is slower to train and less practical for fast production workflows
- Commercial momentum shifted toward Gaussian Splatting in 2025
- Hybrid approaches may still matter, but do not build the strategy around pure NeRF alone

**Practical rule**: monitor developments, but do not default to heavy NeRF investment.

### 1.2 LiDAR is the wrong default for food and product capture

- Detail quality for small objects is weaker than strong photogrammetry
- Texture/color fidelity is not the same as high-quality photo-based capture
- Small objects are a poor fit relative to the cost of the hardware
- LiDAR is more relevant for spatial/room capture than for food/product presentation

**Practical rule**: do not treat LiDAR as the main path for restaurant/product capture.

### 1.3 Single-image AI 3D is not premium-deliverable-ready

- Apple SHARP and similar systems are promising
- They are useful for fast previews and experimentation
- They still have a meaningful quality gap versus strong multi-image capture workflows
- Output quality remains heavily dependent on the source image

**Practical rule**: acceptable for previews or lower-tier experimentation, not as the assumed premium production standard.

### 1.4 Luma AI’s pivot is a warning

- Luma moved away from pure 3D scanning emphasis toward video AI
- This suggests pure consumer scanning alone is a weak moat

**Lesson**: the managed service, quality control, and business workflow matter more than the scanning novelty itself.

### 1.5 Gaussian Splatting has real visual limitations

- Can look chunky or unstable when poorly optimized
- Fine geometric precision may still be weaker than desired in some cases
- Production quality may require post-processing or hybrid workflows

**Practical rule**: treat it as promising, not automatically perfect.

---

## 2. Competitor Failures & Business Lessons

### 2.1 DIY scanning creates inconsistent output

- User-controlled capture quality varies too much
- Restaurants and similar customers usually do not want to learn capture workflows
- Inconsistent capture leads to weak trust and poor repeat usage

**Lesson**: managed execution is part of the product value.

### 2.2 AR/3D products fail when the content quality is weak

- Low-quality 3D content makes the experience feel gimmicky
- Customers may try it once and abandon it if the asset quality is not impressive

**Lesson**: quality of the 3D output is central, not optional.

### 2.3 Enterprise tools are often overpriced for restaurant customers

- Traditional enterprise tooling is often too expensive for restaurant-scale budgets
- There is space for premium quality with more practical pricing

**Lesson**: position as premium and trustworthy, but do not drift into unrealistic enterprise-tool pricing for restaurant use cases.

---

## 3. Market Expansion Risks

### 3.1 Russia requires exceptional caution

- Data localization requirements are serious
- Russian user data may require local hosting and infrastructure decisions separate from the current stack
- Legal and sanctions-related constraints may shift

**Practical rule**: Russia is a strategic future consideration, not a default execution target.

### 3.2 Payments and legal structure can become blockers in Russia

- Western payment assumptions may fail
- Entity structure, compliance, and payment rails may need a dedicated plan

**Practical rule**: no casual execution here; legal and operational review must come first.

### 3.3 EU expansion is not one-size-fits-all

- Language, buying behavior, proof expectations, and payment habits differ by country
- Generic cross-market marketing can underperform badly

**Practical rule**: localized trust, proof, and messaging matter.

### 3.4 Expanding too fast damages quality

- New markets add operational complexity before they add reliable revenue
- Quality control gets harder with distance and fragmented teams

**Practical rule**: do not expand faster than quality systems can support.

---

## 4. Web / UX Anti-Patterns

### 4.1 Dark mode is not automatically better

- Dark mode may help brand positioning and some user segments
- It is not universally better for readability, conversion, or trust
- Context and audience matter more than design fashion

**Practical rule**: keep dark as current positioning, but do not assume it is permanently optimal without evidence.

### 4.2 Too many form fields reduce conversion

- Every extra field increases friction
- High-intent B2B forms can be longer, but only if the added fields are clearly worth it
- Multi-step flows help only if each step remains easy

**Practical rule**: treat form complexity as a conversion cost that must be justified.

### 4.3 Generic landing pages underperform

- Broad, vague pages convert worse than pages with strong context and fit
- Different verticals likely need more tailored messaging eventually

**Practical rule**: avoid one-size-fits-all messaging when focused positioning would be stronger.

### 4.4 Hero sections that do not explain the offer quickly fail

- Visitors need fast clarity
- Vague CTA wording reduces action
- The product must be understandable within seconds

**Practical rule**: clarity before cleverness.

### 4.5 Trust cannot be assumed

- Weak proof, weak claims, or vague enterprise language lower credibility
- Missing reassurance near CTAs reduces conversion confidence

**Practical rule**: trust signals must be concrete, credible, and placed where decisions happen.

---

## 5. Automation Challenges

### 5.1 Fully automated photogrammetry can fail for predictable reasons

Common failure cases:
- insufficient photo overlap
- poor or inconsistent lighting
- reflective or transparent surfaces
- too few images
- bad orientation or scale capture

**Practical rule**: SOPs and quality gates matter more than automation ambition alone.

### 5.2 Auto-QA is easy to get wrong

- False positives waste time
- False negatives damage trust and brand quality
- Thresholds need conservative rollout and human oversight

**Practical rule**: start strict, measure, and adjust carefully.

### 5.3 Cloud processing costs can spike quickly

- GPU workloads can become expensive
- Unit economics matter early, not only at scale
- Idle-cost and burst-cost patterns need active control

**Practical rule**: monitor per-model cost and avoid assuming automation is automatically cheap.

---

## 6. Execution Pitfalls Inside This Project

### 6.1 Do not ignore existing public pages while chasing future features

- Current public pages have immediate business impact
- Conversion friction, weak trust, responsiveness issues, or unclear CTAs matter more right now than speculative future features

**Practical rule**: fix what directly affects leads first.

### 6.2 Do not trust background agents blindly

Known prior issues:
- research agents produced empty or weak outputs due to rate limits
- agent audits generated false positives
- “unused code” or “safe to remove” claims were not always reliable

**Practical rule**: manually verify important findings before acting on them.

### 6.3 Do not over-trust roadmap metrics that are not measured

- Some targets in plans are directional, not verified production analytics
- Placeholder metrics should not be treated as proven business data

**Practical rule**: separate aspirations from measured reality.

### 6.4 Do not let future-platform excitement justify weak current UX

- Advanced roadmap items can feel strategically exciting
- They do not compensate for a weak public website, confusing request flow, or low-trust presentation

**Practical rule**: immediate website quality remains the default priority.

### 6.5 Do not rewrite large areas without evidence

- Large rewrites increase risk and can erase working logic
- Small targeted improvements are safer and easier to validate

**Practical rule**: prove need before broad rewrites.

### 6.6 Do not confuse “technically impressive” with “commercially useful”

- Advanced 3D features can be impressive without improving conversion or retention
- Customers buy outcomes, trust, and usable quality

**Practical rule**: prioritize what improves the business and user experience, not just what looks advanced.

---

## 7. Messaging and Positioning Risks

### 7.1 Do not drift into self-serve language

- This project is a managed service
- Messaging that sounds self-serve can create false expectations

**Practical rule**: keep the quote/request-led managed-service framing.

### 7.2 Do not overclaim security, compliance, or scale

- Claims must match what is already true and consistently supported
- Overclaiming damages trust more than modest wording

**Practical rule**: use only validated trust language.

### 7.3 Do not use vague CTA language

- Generic CTA copy lowers clarity and action rate
- CTA wording should reflect the real next step

**Practical rule**: keep CTA language aligned with the free-quote flow.

---

## 8. Current Priority Warning

The biggest current strategic mistake would be:

> spending too much energy on future platform expansion while the public site still has room to improve in clarity, trust, conversion, responsiveness, accessibility, and polish.

Use this as a recurring correction mechanism whenever work starts drifting too far from current priorities.

---

## 9. Maintenance Rule

When a warning becomes outdated:

1. update this file
2. update any conflicting plan/decision files if needed
3. remove advice that no longer reflects current reality

Keep this file practical, not theoretical.