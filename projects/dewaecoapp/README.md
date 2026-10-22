# DEWAEcoApp

A sustainability web project originally developed for the DIDI Design Competition (December 2024–June 2025), exploring practical ways to reduce household water/electricity use and compare efficient products.

**[Try the interactive application](https://rinadsinger08-ui.github.io/portfolio/projects/dewaecoapp/app/)** · **[Project case study](https://rinadsinger08-ui.github.io/portfolio/projects/dewaecoapp/)** · **[Published app source](app/)** · **[Original React calculator source](source/)**

## Features available in the interactive app

- **Photo-first utility tracking:** on mobile, choose the camera to photograph a bill. OCR attempts to extract relevant information, after which the user reviews bill month, water in cubic metres, and energy in kWh. The extracted readings can populate the dashboard and consumption trends.
- **Monthly comparisons:** calculates absolute and percentage changes, with a zero-denominator guard.
- **Eco product comparison:** explore explicitly fictitious example products and compare purchase price, consumption, monthly water cost, and estimated five-year ownership cost; launch retailer search pages.
- **Water calculator:** manage custom product comparisons with water usage expressed appropriately in litres per minute, per flush, or per cycle, and edit use frequency and water-price assumptions.
- **Purchase receipt review:** photograph a receipt, attempt OCR, and save a local evidence-review record.
- **Local storage:** save or remove tracking and review records in the browser, with exact-file and identifier-based duplicate detection on the local device.

## Accuracy and safety boundaries

This is an **independent student project**, **not an official DEWA product or partnership**. **No redeemable DEWA points are issued**. Scanning text from a photo is not evidence that the document or the purchase is genuine; any real rewards platform requires identity verification, server-side controls, official utility/retailer authorization, transaction verification, and fraud review. No Amazon or Carrefour account credentials are requested or used by this release.

The example catalog and its prices are illustrative rather than live or product-verified. The water cost model uses a user-editable illustrative AED/m³ variable tariff and does **not** predict full DEWA bills; actual bill amounts depend on slab pricing, surcharges, VAT, and other charges.

Bill images are processed in the browser by an OCR library loaded on demand from a CDN. The original image is not saved by the app. LocalStorage is **not secure storage**; avoid using confidential bill or receipt data on a shared device. There is no backend authentication or user account system yet.

## Architecture

- `app/`: public static HTML, CSS and JavaScript client, deployed through GitHub Pages without a build step
- `source/`: the original React / TypeScript water calculator plus supporting project setup
- The separately published Bolt Utility Tracker informed the user-interface and tracking workflow, but the public static preview is not the same codebase as that Bolt deployment

## Prior technical work

Original React/TypeScript prototypes included stateful product entry, recommendation cards, monthly/annual/five-year cost comparisons, simulated receipt matching and simulated retailer account status. The current public preview replaces the unsafe automatic rewards behavior with explicitly unverified document review.

## Future production integration

A real verified rewards service would need a private backend, authenticated accounts, secure document storage and deletion, server-controlled points ledger, reliable OCR, document fraud checks, retailer-approved catalog and order APIs, and DEWA partnership for bill verification and redemption. These integrations are **not included** in this public demo.
