import type { ProductCategory } from './index';
export interface CalculatorEntry {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  flowRate: number;
  source: string;
}
