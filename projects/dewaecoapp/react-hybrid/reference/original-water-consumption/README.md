# Recovered original Bolt water-consumption files

The three source files in this folder are reproduced **unchanged** from the user's complete paste on 21 October 2026. These are archived for design history and are **not** compiled by the integrated application. The original supporting files were shared separately. Their original user-input interface supports product search, adding multiple comparison products, and manually editing usage assumptions.

**Not safe for live rewards:** original mock retailer connections toggle only React state, receipt matching is a prompt, and results may add points directly in the browser. The old catalog has illustrative items; generic agency URLs are not SKU-specific verification. The old calculator assumes US dollars, GPM, and a flat $/gallon. Toilets are specified in gallons/flush, washers and dishwashers in gallons/cycle or other metrics — never compare these as gallons/minute.

Current integrated application (`src/components/WaterCalculator.tsx`) recreates the original comparison workflow with category-specific units, explicit AED/m³ tariff assumptions, review-first evidence, and zero automatic rewards. The utility-tracker product discovery remains active too.
