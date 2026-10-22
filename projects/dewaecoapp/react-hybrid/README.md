# DEWAEcoApp — React / TypeScript hybrid source

**Recruiter-friendly source** for the DEWAEcoApp concept developed for the DIDI Design Competition (December 2024–June 2025), expanded into a unified application prototype in October 2026.

- [Try the stable, published demo](https://rinadsinger08-ui.github.io/portfolio/projects/dewaecoapp/app/)
- [Read the case study](https://rinadsinger08-ui.github.io/portfolio/projects/dewaecoapp/)

## Why two implementations?

The **stable deployed demo** uses build-free JavaScript/HTML/CSS so recruiters can actually try utility tracking, product comparisons, simulated conservation points, and photo-review flows. This directory preserves and extends the **React + TypeScript implementation**, split into typed, maintainable components, utilities, and tests. **The two are separate implementations, not one application sharing state.** The React variant has not been deployed or verified via a full Vite build in this environment due to inaccessible npm dependencies.

## Features represented in this source

- React components for Dashboard, Eco Products, Water Calculator, and photo-based Scan & Review
- TypeScript domain types, pure monthly/annual/five-year cost calculations, product comparison, OCR parsing, conversion between litres, m³, and gallons
- Camera-first bill submission with reviewed numeric fields and same-entered-account month-to-month comparisons
- **Illustrative scoring only:** 10 hypothetical points if water usage decreases; 10 more if electricity decreases. Only consecutive months of photo-imported records match, and no official DEWA points exist
- On-device records and duplicate photo detection, with conspicuous authenticity and privacy warnings
- The originally supplied `App.tsx`, `ProductDiscovery.tsx`, and `catalog.ts` are preserved under `reference/original-water-consumption/` as historical snapshots, not active components

## Run it

```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

A production build requires network access to install npm dependencies. **Do not deploy the uncompiled TypeScript source as static files**; Vite writes distributable files to `dist/`.

## Correctness caveats

- **Not affiliated with DEWA** and no authorized utility-bill redemption or retailer order integration. Photo OCR is not verification of authenticity; manual correction and device-local records are not fraud-proof.
- Retailer links open Amazon UAE or Carrefour searches; they do not authenticate orders. Sample products/prices are illustrative.
- Rates are editable scenario assumptions, not accurate full DEWA bill forecasts; true tariffs involve slabs, surcharges and VAT.
- Camera OCR currently depends on English Tesseract.js model downloads; no full Arabic/PDF support.
- LocalStorage is not appropriate for genuine bills with identifying details, especially on shared computers.

## Engineering focus

I/O boundaries are kept separate from pure calculation functions. The `tests/validate.cjs` suite checks category units and water scenario math. The `tests/conservation.test.cjs` suite validates the proposed rewards logic: consecutive months, year rollover, same account, water-only/electricity-only reductions, and exclusion of legacy/manual records.
