# DEWAEcoApp

React / TypeScript sustainability prototype developed for the DIDI Design Competition, December 2024–June 2025.

[Project case study](https://rinadsinger08-ui.github.io/portfolio/projects/dewaecoapp/) · [Recovered source](source/App.tsx)

## Sustainability rewards concept

The proposed app gives users two ways to earn DEWA points:

- **Sustainable purchases:** sign in and buy sustainable-labelled products or recommended sustainable substitutes through participating retailers to earn points.
- **Reduced utility use:** scan a water or electricity bill and compare its consumption with the previous month's bill. A decrease in water or electricity usage earns points.

This is the broader product concept. The recovered source contains simulated receipt and retailer flows; it does not establish working sign-in, purchase verification, bill scanning, month-to-month consumption comparison, or real DEWA point issuance.

## What is inspectable

The original `App.tsx` snapshot implements an interactive water-consumption calculator: add, edit, and remove products; update daily usage and water price; compare monthly, annual, and five-year costs. It uses typed product records and React state.

The cost model assumes 30 days per month and 12 months per year. Flow rates are gallons per minute; the rate is USD per gallon. These are prototype assumptions, not live utility tariffs.

## Prototype boundaries

- Receipt scanning is a text prompt that **simulates** a scan; it does not implement OCR, a camera, or a receipt-upload service.
- Amazon and Carrefour connection buttons toggle local UI state. They do not authenticate or connect real retailer accounts.
- Purchase checks use `['Example Purchase']`, not a retailer API.
- The proposed utility-bill comparison and points for reduced monthly water/electricity use are not implemented in the recovered `App.tsx` snapshot.
- The snapshot imports `./types` and `./utils/dweaPoints`. Those supporting files were not included in the recovered material, so this is an inspectable source snapshot, not a complete runnable React app.
- Product labels do not have explicit input associations, and numeric inputs rely on HTML `min` values without complete validation. These are known limitations, not finished accessibility or validation claims.

## Contribution and deliverable

Built the React / TypeScript calculator interface, cost comparisons, and state-driven product interactions. Prototyped conservation-reward and partner-account flows as part of the broader sustainability concept. The source is preserved as recovered; the case-study page documents its actual behavior rather than filling in unavailable original code.

## Next work

Recover the missing types and reward helpers, then add a reproducible build. Improve numeric validation and input labels; replace mock verification only if a permitted integration becomes available.
