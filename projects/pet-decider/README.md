# Pet Decider

A standalone browser app that expands the original App Lab pet recommendation project into explainable matching, comparison, and persistent local history.

**Stack:** HTML · CSS · JavaScript ES modules · Node.js built-in test runner. No framework, dependencies, backend, or build step.

## Use it

Run `npm start` from the repository root, then open `http://127.0.0.1:3000/projects/pet-decider/`. Run `npm test` for the engine and storage checks. GitHub Pages can serve the same files at `/portfolio/projects/pet-decider/` when publishing from the repository root.

## What changed from App Lab

| Original | Web app |
| --- | --- |
| Nested conditionals return one pet | A data-driven catalog returns all qualifying options, ranked with reasons |
| Home size, time, categorical budget | Space, daily time, two budgets, housing permission, furry-animal preference, activity, experience, backup care |
| Session-only recommendation list | Deduplicated history of 10 profiles in localStorage; reload/revisit and confirmed deletion |
| Platform-specific screens and events | Responsive semantic HTML, keyboard controls, error summaries, live announcements |
| Unmatched inputs can fall through to a cat | Explicit no-match result with a reason for every exclusion |
| UI and decision logic interleaved | Pure engine, editable catalog, storage module, separate DOM controller |

## Matching rules

Hard constraints must pass **before** ranking. Pet permission and backup care must be confirmed; avoiding furry animals excludes mammals. Each option must meet the catalog's space, time, monthly, and setup assumptions. Activity alignment adds two ranking points. Experienced owners, or entries flagged for first-time owners, add one point. Ties sort by pet ID. The score is not a percentage or confidence estimate.

| Option | Daily minutes | Monthly CAD | Setup CAD | Space category |
| --- | --- | --- | --- | --- |
| Adult cat | 60 | 100 | 350 | Small or larger |
| Adult dog | 120 | 180 | 500 | Small or larger |
| Bonded rabbit pair | 90 | 140 | 550 | Medium or larger |
| Freshwater aquarium | 30 | 40 | 250 | Small or larger |

**All numbers are illustrative planning assumptions**, not researched prices, professional advice, or verified minimum care requirements. They are editable in `src/pets.js`. Home size, reported time, and budget cannot determine whether a specific animal will thrive. Emergency care, adoption fees, training, travel care, and local prices can change costs substantially. A shelter's individual assessment should guide adoption.

Qualitative care notes are informed by the RSPCA's [cat](https://www.rspca.org.uk/adviceandwelfare/pets/cats), [dog](https://www.rspca.org.uk/adviceandwelfare/pets/dogs), [rabbit](https://www.rspca.org.uk/adviceandwelfare/pets/rabbits), and [fish](https://www.rspca.org.uk/adviceandwelfare/pets/fish) guides. Rabbit companionship and fish habitat complexity are reflected in the catalog. Numeric rules and ranking are this project's design choices, not rules published by the RSPCA.

## Edge cases

- Blank input is invalid; numeric zero is valid and can produce no match.
- Reject unknown options, non-finite values, negatives, non-decimal syntax, and out-of-range values. Bounds: 0–720 minutes, 0–10,000 CAD monthly, 0–20,000 CAD setup. Finite decimals are allowed.
- Exact resource thresholds qualify; any shortfall excludes the option. No forced fallback.
- Changes to answers invalidate stale results; reset keeps history.
- Repeating an equivalent profile updates its position instead of duplicating it.
- Corrupted records are skipped. Denied storage or quota errors preserve session functionality with a visible message.
- Saved profiles are revalidated and results recomputed on revisit. Dynamic text uses `textContent`, not HTML interpolation.

Tests include a 1,512-profile sweep asserting that no result fails a hard constraint. This is one test that checks 1,512 input profiles, not 1,512 separate tests. GitHub Actions runs the Node tests and browser checks on pushes and pull requests.

Browser checks cover validation, comparison, history, stale results, corrupted/denied storage, and desktop/mobile layout. Run `npm ci`, `npx playwright install chromium`, then `npm run test:browser`. Playwright starts and stops the local server automatically. Screenshots go to ignored `test-results/`. The browser app has no runtime dependencies; Playwright is a pinned development dependency. Node.js supplies testing and local static serving, not an application backend.

## Files

| File | Responsibility |
| --- | --- |
| `src/pets.js` | Catalog and care references |
| `src/engine.js` | Validation, filtering, stable ranking, profile keys |
| `src/history.js` | Bounded persistence and storage recovery |
| `src/app.js` | DOM rendering and events |
| `tests/` | Engine and history regression checks |

Possible extensions: regional cost data with provenance, shelter-specific assessments, and a larger catalog. These are future work, not current features.
