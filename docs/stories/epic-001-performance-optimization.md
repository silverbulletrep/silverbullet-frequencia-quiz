# Epic 001: Performance and Speed Optimization

**Status:** Draft
**Priority:** High
**Owner:** PM (Morgan)

## 🎯 Epic Goal
Improve the loading speed and performance metrics of all funnel pages, ensuring every page achieves a Lighthouse score of 80+ to maximize conversion and site health.

## 📝 Epic Description

**Existing System Context:**
- **Current Situation (Pages < 80 Score):** 
    - `/fim`: Score 57 (Critical)
    - `/resultado`: Score 66
    - `/vsl`: Score 67
    - `/processing`: Score 67
    - `/women-success`: Score 71
    - `/audio-upsell`: Score 78
- **Technology Stack:** Vite, React, TailwindCSS.
- **Integration Points:** 
    - Impact involves main routing components, heavy component loading (checkouts, video players), and asset management.

**Enhancement Details:**
- **What:** Analyze and optimize code splitting, asset loading, and render blocking resources on identified pages.
- **Why:** Faster load times directly correlate with higher conversion rates, especially on mobile devices where these funnels are often accessed.
- **Success Criteria:** 
- All funnel pages MUST achieve a Lighthouse Performance score >= 80.
- No broken functionality in checkout, video playback, or tracking.

---

## 📚 Stories

### Story 1: Optimize Critical Conversion Pages (/fim, /resultado, /audio-upsell)
**Description:** Focus on the pages where the final transaction and upsells occur.
- **Predicted Agents:** @dev
- **Quality Gates:**
    - **Pre-Commit:** Linting, Unused code removal.
    - **Pre-PR:** Build verification, Manual Lighthouse check.
- **Key Actions:**
    - Audit `/fim` for heavy imports (Checkout components).
    - Implement lazy loading for non-critical components on `/resultado`.
    - Optimize assets for `/audio-upsell`.

### Story 2: Optimize Funnel Engagement Pages (/processing, /vsl, /women-success)
**Description:** Improve the intermediate pages that maintain user interest and momentum.
- **Predicted Agents:** @dev
- **Quality Gates:**
    - **Pre-Commit:** Linting.
    - **Pre-PR:** Manual Lighthouse run.
- **Key Actions:**
    - Investigate `/vsl` video player loading strategy.
    - Optimize animations and scripts on `/processing`.
    - Audit `/women-success` for slow-loading images or scripts.

---

## 🛡 Risk Mitigation

- **Primary Risk:** Optimizations (lazy loading) might cause layout shifts (CLS) or delay interactive elements (FID), potentially breaking the seamless feel.
- **Mitigation:** Use skeletons/placeholders for lazy-loaded components. Test manually on mobile network simulation (Fast 3G).
- **Rollback Plan:** Revert specific optimization commits if functionality breaks. Keep a baseline measurement before starting.

## ✅ Definition of Done
- [ ] All stories completed.
- [ ] Lighthouse scores for target pages are > 80 (or show significant improvement if 80 is unattainable due to 3rd party scripts).
- [ ] Visual regression testing confirms no layout breaks.
- [ ] Checkout and VSL functionality verified operational.
