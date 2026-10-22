/** Pure, category-aware water consumption and 5-year cost estimates. */
export interface ScenarioResult {
  monthlyLitres: number;
  annualLitres: number;
  monthlyWaterCostAed: number;
  annualWaterCostAed: number;
  fiveYearTotalCostAed: number;
}
function finiteNonnegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be a finite nonnegative number`);
  return value;
}
/** usagePerMonth is minutes for L/min, flushes for L/flush, cycles for L/cycle. */
export function calculateWaterScenario(
  litresPerUse: number,
  usagePerMonth: number,
  waterTariffAedPerM3: number,
  purchasePriceAed: number,
): ScenarioResult {
  const rate = finiteNonnegative(litresPerUse, 'Water use per unit');
  const uses = finiteNonnegative(usagePerMonth, 'Usage per month');
  const tariff = finiteNonnegative(waterTariffAedPerM3, 'Water tariff');
  const price = finiteNonnegative(purchasePriceAed, 'Purchase price');
  const monthlyLitres = rate * uses;
  const annualLitres = monthlyLitres * 12;
  const monthlyWaterCostAed = (monthlyLitres / 1000) * tariff;
  const annualWaterCostAed = monthlyWaterCostAed * 12;
  const fiveYearTotalCostAed = price + (annualWaterCostAed * 5);
  return { monthlyLitres, annualLitres, monthlyWaterCostAed, annualWaterCostAed, fiveYearTotalCostAed };
}
