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

This revision restores the original Code.org animal categories and photos (served from the original public Code.org asset library). The categories are starting points for research, not promises that adopting an animal will be safe or affordable. SVG icons are fallbacks if the original site is unavailable.


The app pauses if housing permission is unconfirmed, daily care time is zero, or both budgets are zero. Avoiding furry animals excludes mammals. Time, budget, space, and backup-care gaps are explained as cautions; other inputs contribute to ranking scores. Scores are NOT confidence, probabilities, or evidence of suitability.

| Option | Daily minutes | Monthly CAD | Setup CAD | Space category |
| --- | --- | --- | --- | --- |
| Cat | 60 | 100 | 350 | Small or larger |
| Dog | 120 | 180 | 500 | Medium or larger |
| Small dog | 100 | 150 | 450 | Small or larger |
| Rabbit pair | 90 | 140 | 550 | Medium or larger |
| Hamster | 30 | 45 | 150 | Small or larger |
| Bird | 60 | 80 | 250 | Small or larger |
| Turtle | 45 | 70 | 300 | Small or larger |
| Fish | 30 | 40 | 250 | Small or larger |

**All numbers are illustrative planning assumptions**, not researched prices, professional advice, or verified minimum care requirements. They are editable in `src/pets.js`. Home size, reported time, and budget cannot determine whether a specific animal will thrive. Emergency care, adoption fees, training, travel care, and local prices can change costs substantially. A shelter's individual assessment should guide adoption.

Qualitative care notes are informed by the RSPCA's [cat](https://www.rspca.org.uk/adviceandwelfare/pets/cats), [dog](https://www.rspca.org.uk/adviceandwelfare/pets/dogs), [rabbit](https://www.rspca.org.uk/adviceandwelfare/pets/rabbits), and [fish](https://www.rspca.org.uk/adviceandwelfare/pets/fish) guides. Rabbit companionship and fish habitat complexity are reflected in the catalog. Numeric rules and ranking are this project's design choices, not rules published by the RSPCA.

## Edge cases

- Blank input is invalid; zero is valid. No care time, or no monthly and setup budget together, produces no recommendations.
- Reject unknown options, non-finite values, negatives, non-decimal syntax, and out-of-range values. Bounds: 0–720 minutes, 0–10,000 CAD monthly, 0–20,000 CAD setup. Finite decimals are allowed.
- Model resource shortfalls reduce rankings and are clearly displayed; no-match is reserved for missing housing permission, zero care time, or a combination of zero budgets.
- Changes to answers invalidate stale results; reset keeps history.
- Repeating an equivalent profile updates its position instead of duplicating it.
- Corrupted records are skipped. Denied storage or quota errors preserve session functionality with a visible message.
- Saved profiles are revalidated and results recomputed on revisit. Dynamic text uses `textContent`, not HTML interpolation.

Tests include a 1,512-profile sweep for hard eligibility rules, matching diversity, and result accounting. It does not establish real-world pet suitability. This is one test that checks 1,512 input profiles, not 1,512 separate tests. GitHub Actions runs the Node tests and browser checks on pushes and pull requests.

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
