export interface Bill {
  id: string;
  month: number;
  year: number;
  waterUsage: number;
  waterCost: number;
  energyUsage: number;
  energyCost: number;
  source?: 'scan' | 'legacy';
  accountId?: string; // entered account identifier, NOT proof of identity
}

export interface User {
  id: string;
  name: string;
  points: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: Date;
  pointsAwarded: number;
}

export interface MonthlyComparison {
  currentMonth: Bill;
  previousMonth: Bill | null;
  waterChange: number;
  energyChange: number;
  pointsEarned: number;
}

// ---- Sustainable product discovery ----

export type ProductCategory =
  | 'showerheads'
  | 'faucets'
  | 'toilets'
  | 'washing_machines'
  | 'dishwashers';

export interface ProductSpec {
  name: string;
  brand: string;
  category: ProductCategory;
  flowRate: number;
  unit: 'L/min' | 'L/flush' | 'L/cycle';
  price: number;
  specSource: string;
  retailerSearchUrl: string;
  description?: string;
}

export interface ProductConsumption {
  monthlyLiters: number;
  annualLiters: number;
  monthlyCostAed: number;
  annualCostAed: number;
  fiveYearWaterCostAed: number;
  fiveYearTotalCostAed: number;
}

export interface ProductComparisonResult {
  product: ProductSpec;
  consumption: ProductConsumption;
  isLowestWater: boolean;
  isLowestFiveYearCost: boolean;
}

export interface ProductRecommendation {
  lowestWater: ProductComparisonResult | null;
  lowestFiveYearCost: ProductComparisonResult | null;
  tradeOff: string;
}
