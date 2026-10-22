# DEWAEcoApp — October 21 source integration

## Recovered historical files
- `reference/original-water-consumption/src/App.tsx`: original two-tab Bolt product finder + manual water calculator, simulated rewards.
- `reference/original-water-consumption/src/components/ProductDiscovery.tsx`: 2-product comparison/recommendations and retailer search links.
- `reference/original-water-consumption/src/data/catalog.ts`: historical illustrative US catalog (17 entries, not a verified live inventory).

## Integrated app screens
1. Dashboard: manually tracked water/electricity usage; estimated rewards only, no issuance.
2. Eco Products: existing UAE 15-example discovery, side-by-side comparison, retailer search links, manual fallback. New **To calculator** button sends a product into an editable shared scenario.
3. Water Calculator: recovered multi-product calculator concept, now using category-specific L/min, L/flush or L/cycle, AED purchase prices and AED/m³ water-tariff assumptions. Highlights lowest water use and lowest five-year cost, including ties. Persists product entries locally.
4. Scan & Review: image OCR on bills/receipts, reviewed fields and local pending-review records; does not award points. Photos themselves are not retained.

## Verification performed in this environment
`NODE_PATH=/opt/nvm/versions/node/v22.16.0/lib/node_modules npm test` passed: TypeScript/TSX syntactic transpilation, bill unit conversion, receipt/bill parsing, manual scenario calculations, validation and five-year costs.

**Not verified:** npm package installation, full TypeScript semantic type checking, Vite production build or a real browser scan, because dependencies could not be installed. This ZIP is **source code**, not an uploadable Netlify Drop build. Install dependencies and build the `dist` folder first.

## Important gaps
The system is NOT connected to DEWA, Amazon order-history APIs, or Carrefour customer accounts. The local pending-review documents are not verified by a trusted server. No exchangeable points, actual bills, real orders, or officially certified products are represented. Do not launch a live rewards program without backend, credentials, legal agreements, consent and review controls.
