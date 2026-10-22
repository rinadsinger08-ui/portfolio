# DEWAEcoApp hybrid — engineering notes

## What belongs where

- [Interactive live demo](../app/) — published build-free JavaScript implementation, browser-tested for navigation, product comparison, calculator, and camera navigation.
- [React + TypeScript source](./) — typed, modular React implementation reflecting the same overall concept, supplied as source and **not** presented as the deployed build.
- [Historical original water-consumption files](reference/original-water-consumption/) — archived snapshots, including original React `App.tsx`, Product Discovery and catalog, preserved for provenance.

## Main components

`src/App.tsx` — React navigation and product transfer into calculator.  
`src/components/Dashboard.tsx` — camera-first entrypoint, recent usage, charts, and simulated points panel.  
`src/components/EvidenceCenter.tsx` — browser image OCR, review fields, local document tracking.  
`src/context/BillContext.tsx` — typed month-to-month bill tracking.  
`src/utils/conservationPoints.ts` — pure function calculating hypothetical rewards, isolated from any redeemable ledger.  
`src/components/ProductDiscovery.tsx` and `WaterCalculator.tsx` — discovery, usage/cost estimates, and comparisons.

## Verification

- TypeScript syntax transcription tests pass (22 files).
- Water conversion and cost scenario checks pass.
- Nine hypothetical scoring scenarios pass (same account, consecutive months, December rollover, each utility independently, and ineligible records).
- Full React build/typecheck and production browser testing require installing npm dependencies, unavailable in the current build environment. The live static app remains the stable published frontend.

## Boundaries

No official DEWA integration, live retailer order verification, fraud-proof identity checks, redeemable rewards, or production database. The product list is illustrative. Evidence data is local-only and unverified.
