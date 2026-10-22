import { ProductSpec, ProductConsumption, ProductComparisonResult, ProductRecommendation } from '../types';
import { USAGE_ASSUMPTIONS, WATER_COST_PER_LITRE } from './usageAssumptions';

export function calculateProductConsumption(product: ProductSpec): ProductConsumption {
  const assumption = USAGE_ASSUMPTIONS[product.category];
  const monthlyLiters = product.flowRate * assumption.cyclesPerMonth;
  const annualLiters = monthlyLiters * 12;
  const monthlyCostAed = monthlyLiters * WATER_COST_PER_LITRE;
  const annualCostAed = monthlyCostAed * 12;
  const fiveYearWaterCostAed = annualCostAed * 5;
  const fiveYearTotalCostAed = product.price + fiveYearWaterCostAed;

  return { monthlyLiters, annualLiters, monthlyCostAed, annualCostAed, fiveYearWaterCostAed, fiveYearTotalCostAed };
}

export function compareProducts(products: ProductSpec[]): ProductComparisonResult[] {
  const results = products.map((product) => ({
    product, consumption: calculateProductConsumption(product), isLowestWater: false, isLowestFiveYearCost: false,
  }));
  if (results.length === 0) return results;
  const lowestWater = results.reduce((min, r) => r.consumption.annualLiters < min.consumption.annualLiters ? r : min);
  const lowestCost = results.reduce((min, r) => r.consumption.fiveYearTotalCostAed < min.consumption.fiveYearTotalCostAed ? r : min);
  return results.map((r) => ({ ...r, isLowestWater: r === lowestWater, isLowestFiveYearCost: r === lowestCost }));
}

export function buildRecommendation(results: ProductComparisonResult[]): ProductRecommendation {
  if (results.length === 0) return { lowestWater: null, lowestFiveYearCost: null, tradeOff: '' };
  const lowestWater = results.reduce((min, r) => r.consumption.annualLiters < min.consumption.annualLiters ? r : min);
  const lowestFiveYearCost = results.reduce((min, r) => r.consumption.fiveYearTotalCostAed < min.consumption.fiveYearTotalCostAed ? r : min);
  let tradeOff = '';
  if (lowestWater === lowestFiveYearCost) {
    tradeOff = 'The most water-efficient option is also the lowest five-year cost, so it is the clear recommendation.';
  } else {
    const waterSavings = lowestFiveYearCost.consumption.annualLiters - lowestWater.consumption.annualLiters;
    const extraCost = lowestWater.consumption.fiveYearTotalCostAed - lowestFiveYearCost.consumption.fiveYearTotalCostAed;
    if (extraCost > 0) {
      tradeOff = `The lowest-water product costs AED ${extraCost.toFixed(0)} more over five years but saves ~${waterSavings.toLocaleString()} L/year. Choose it if conserving water matters more than upfront cost; choose the lowest-cost product if budget is the priority.`;
    } else {
      tradeOff = 'The lowest-water product is also cheaper over five years, making it the clear recommendation.';
    }
  }
  return { lowestWater, lowestFiveYearCost, tradeOff };
}
