# DEWAEcoApp

React / TypeScript sustainability prototype developed for the DIDI Design Competition, December 2024–June 2025.

[Project case study](https://rinadsinger08-ui.github.io/portfolio/projects/dewaecoapp/) · [Restored calculator source](source/) · [Live utility dashboard (sample data)](https://utility-bill-trackin-92l7.bolt.host/)

## Sustainability rewards concept

The proposed app gives users two ways to earn DEWA points:

- **Sustainable purchases:** sign in and buy sustainable-labelled products or recommended sustainable substitutes through participating retailers to earn points.
- **Reduced utility use:** scan a water or electricity bill and compare its consumption with the previous month's bill. A decrease in water or electricity usage earns points.

This is the broader product concept. The recovered source contains simulated receipt and retailer flows; it does not establish working sign-in, purchase verification, bill scanning, month-to-month consumption comparison, or real DEWA point issuance.

## Two related prototypes

**Product water-cost calculator:** the original React/TypeScript code and the subsequently supplied TypeScript helpers have been restored under `source/` with a Vite scaffold. Its interactive product comparison and reward simulations are implemented in the source; a new clean-install build has not yet been verified.

**Utility Bill Tracker:** a separate Bolt-hosted dashboard displays example water and electricity consumption, monthly comparisons, trends, conservation points, and tips. It is publicly viewable, but the displayed data is sample data; no working bill upload or direct integration between these prototypes has been verified.

## What is inspectable

The original `App.tsx` snapshot implements an interactive water-consumption calculator: add, edit, and remove products; update daily usage and water price; compare monthly, annual, and five-year costs. It uses typed product records and React state.

The cost model assumes 30 days per month and 12 months per year. Flow rates are gallons per minute; the rate is USD per gallon. These are prototype assumptions, not live utility tariffs.

## Prototype boundaries

- Receipt scanning is a text prompt that **simulates** a scan; it does not implement OCR, a camera, or a receipt-upload service.
- Amazon and Carrefour connection buttons toggle local UI state. They do not authenticate or connect real retailer accounts.
- Purchase checks use `['Example Purchase']`, not a retailer API.
- The proposed utility-bill comparison and points for reduced monthly water/electricity use are not implemented in the recovered `App.tsx` snapshot.
- The originally missing `./types` and `./utils/dweaPoints` have now been supplied and restored with a Vite project scaffold. Build success has not yet been independently verified.
- Product labels do not have explicit input associations, and numeric inputs rely on HTML `min` values without complete validation. These are known limitations, not finished accessibility or validation claims.

## Contribution and deliverable

Originated the DEWA points rewards concept: sustainable-labelled purchases or recommended substitutes earn points, and scanned utility bills are compared month to month to reward reduced water or electricity consumption. Built the React / TypeScript calculator interface, cost comparisons, and state-driven product interactions, and prototyped receipt and partner-account reward flows with simulated data. The case-study page distinguishes these implemented calculator features, the separately published utility dashboard, and the unimplemented real-world integrations.

## Next work

From `source/`, run `npm install`, then `npm run build` (production build) or `npm run dev` (local preview). These commands still need a clean-install verification. Improve numeric validation and input labels; replace mock verification only if a permitted integration becomes available.
