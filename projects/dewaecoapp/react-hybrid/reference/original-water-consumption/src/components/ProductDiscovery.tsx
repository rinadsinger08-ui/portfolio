import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Leaf,
  DollarSign,
  Award,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Droplets,
  Plus,
} from 'lucide-react';
import {
  CatalogProduct,
  ProductCategory,
} from '../types';
import {
  CATEGORIES,
  CATEGORY_MAP,
  getProductsByCategory,
  buildRetailerSearchUrl,
} from '../data/catalog';
import {
  monthlyGallons,
  annualGallons,
  monthlyWaterCost,
  annualWaterCost,
  fiveYearOwnershipCost,
} from '../utils/waterCalculations';

interface ProductDiscoveryProps {
  waterRate: number;
  minutesPerDay: number;
  onAddToManualComparison: (product: CatalogProduct) => void;
}

const FLOW_STATUS_META: Record<
  CatalogProduct['flowRateStatus'],
  { label: string; icon: React.ReactNode; className: string }
> = {
  verified: {
    label: 'Verified',
    icon: <CheckCircle2 size={14} />,
    className: 'bg-green-100 text-green-700',
  },
  manufacturer: {
    label: 'Manufacturer Spec',
    icon: <Info size={14} />,
    className: 'bg-blue-100 text-blue-700',
  },
  estimated: {
    label: 'Estimated',
    icon: <AlertCircle size={14} />,
    className: 'bg-amber-100 text-amber-700',
  },
};

export function ProductDiscovery({
  waterRate,
  minutesPerDay,
  onAddToManualComparison,
}: ProductDiscoveryProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('showerheads');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const products = useMemo(
    () => getProductsByCategory(activeCategory),
    [activeCategory]
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const category = CATEGORY_MAP[activeCategory];
  const effectiveMinutes = minutesPerDay > 0 ? minutesPerDay : category.defaultMinutesPerDay;

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as CatalogProduct[],
    [selectedIds, products]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id]
    );
  };

  const recommendations = useMemo(() => {
    if (selectedProducts.length < 2) return null;

    const lowestWater = [...selectedProducts].sort(
      (a, b) =>
        annualGallons(a.flowRate, effectiveMinutes) -
        annualGallons(b.flowRate, effectiveMinutes)
    )[0];

    const lowestFiveYear = [...selectedProducts].sort(
      (a, b) =>
        fiveYearOwnershipCost(a.price, a.flowRate, effectiveMinutes, waterRate) -
        fiveYearOwnershipCost(b.price, b.flowRate, effectiveMinutes, waterRate)
    )[0];

    return { lowestWater, lowestFiveYear };
  }, [selectedProducts, effectiveMinutes, waterRate]);

  return (
    <div className="space-y-6">
      {/* Demo data notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <HelpCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Demonstration Catalog</p>
          <p>
            These products are illustrative examples with realistic specifications from public
            certification databases (EPA WaterSense, ENERGY STAR) and manufacturer data sheets.
            Prices are representative, not live. Use the retailer links to check current pricing
            and availability. When an authorized Amazon or Carrefour product-data integration is
            available, this will be replaced with live data.
          </p>
        </div>
      </div>

      {/* Category selector */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Search className="text-blue-500" size={20} />
          Search a Product Category
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedIds([]);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mb-4">{category.description}</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search within ${category.label.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-700">
        <Info size={18} />
        Select up to 2 products below to compare them side by side.
      </div>

      {/* Product list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          const monthlyCost = monthlyWaterCost(product.flowRate, effectiveMinutes, waterRate);
          const annualCost = annualWaterCost(product.flowRate, effectiveMinutes, waterRate);
          const fiveYear = fiveYearOwnershipCost(product.price, product.flowRate, effectiveMinutes, waterRate);
          const statusMeta = FLOW_STATUS_META[product.flowRateStatus];

          return (
            <div
              key={product.id}
              className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => toggleSelect(product.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusMeta.className}`}
                  title={`Flow rate verification: ${statusMeta.label}`}
                >
                  {statusMeta.icon}
                  {statusMeta.label}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{product.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-semibold text-gray-800">${product.price.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Flow Rate</p>
                  <p className="font-semibold text-gray-800">{product.flowRate} GPM</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-500">Monthly Water Cost</p>
                  <p className="font-semibold text-blue-700">${monthlyCost.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-green-500">Annual Water Cost</p>
                  <p className="font-semibold text-green-700">${annualCost.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-2 mb-3">
                <p className="text-xs text-purple-500">5-Year Ownership Cost</p>
                <p className="font-semibold text-purple-700">${fiveYear.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-500">
                  <Info size={12} />
                  <span>Source: </span>
                  {product.sourceUrl ? (
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.source}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span>{product.source}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={buildRetailerSearchUrl('amazon', `${product.brand} ${product.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Amazon.ae
                  </a>
                  <a
                    href={buildRetailerSearchUrl('carrefour', `${product.brand} ${product.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Carrefour
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search size={48} className="mx-auto mb-3 opacity-50" />
          <p>No products match your search.</p>
        </div>
      )}

      {/* Comparison panel */}
      {selectedProducts.length === 2 && (
        <ComparisonPanel
          productA={selectedProducts[0]}
          productB={selectedProducts[1]}
          waterRate={waterRate}
          minutesPerDay={effectiveMinutes}
          recommendations={recommendations}
          onAddToManualComparison={onAddToManualComparison}
        />
      )}
    </div>
  );
}

interface ComparisonPanelProps {
  productA: CatalogProduct;
  productB: CatalogProduct;
  waterRate: number;
  minutesPerDay: number;
  recommendations: { lowestWater: CatalogProduct; lowestFiveYear: CatalogProduct } | null;
  onAddToManualComparison: (product: CatalogProduct) => void;
}

function ComparisonPanel({
  productA,
  productB,
  waterRate,
  minutesPerDay,
  recommendations,
  onAddToManualComparison,
}: ComparisonPanelProps) {
  const calcA = {
    monthlyGallons: monthlyGallons(productA.flowRate, minutesPerDay),
    annualGallons: annualGallons(productA.flowRate, minutesPerDay),
    monthlyCost: monthlyWaterCost(productA.flowRate, minutesPerDay, waterRate),
    annualCost: annualWaterCost(productA.flowRate, minutesPerDay, waterRate),
    fiveYear: fiveYearOwnershipCost(productA.price, productA.flowRate, minutesPerDay, waterRate),
  };
  const calcB = {
    monthlyGallons: monthlyGallons(productB.flowRate, minutesPerDay),
    annualGallons: annualGallons(productB.flowRate, minutesPerDay),
    monthlyCost: monthlyWaterCost(productB.flowRate, minutesPerDay, waterRate),
    annualCost: annualWaterCost(productB.flowRate, minutesPerDay, waterRate),
    fiveYear: fiveYearOwnershipCost(productB.price, productB.flowRate, minutesPerDay, waterRate),
  };

  const waterSavings = Math.abs(calcA.annualGallons - calcB.annualGallons);
  const costSavings = Math.abs(calcA.fiveYear - calcB.fiveYear);
  const lowerWaterProduct = calcA.annualGallons < calcB.annualGallons ? productA : productB;
  const lowerCostProduct = calcA.fiveYear < calcB.fiveYear ? productA : productB;

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
        <Droplets className="text-blue-500" />
        Side-by-Side Comparison
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Based on {minutesPerDay} minutes/day usage and ${waterRate.toFixed(4)}/gallon water rate.
      </p>

      {/* Product headers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[productA, productB].map((p) => (
          <div key={p.id} className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold text-gray-800">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.brand}</p>
          </div>
        ))}
      </div>

      {/* Comparison rows */}
      <div className="space-y-2">
        <ComparisonRow
          label="Purchase Price"
          valueA={`$${productA.price.toFixed(2)}`}
          valueB={`$${productB.price.toFixed(2)}`}
          highlightLower
          lowerIsA={productA.price < productB.price}
        />
        <ComparisonRow
          label="Flow Rate"
          valueA={`${productA.flowRate} GPM`}
          valueB={`${productB.flowRate} GPM`}
          highlightLower
          lowerIsA={productA.flowRate < productB.flowRate}
        />
        <ComparisonRow
          label="Monthly Water Consumption"
          valueA={`${calcA.monthlyGallons.toFixed(0)} gal`}
          valueB={`${calcB.monthlyGallons.toFixed(0)} gal`}
          highlightLower
          lowerIsA={calcA.monthlyGallons < calcB.monthlyGallons}
        />
        <ComparisonRow
          label="Annual Water Consumption"
          valueA={`${calcA.annualGallons.toFixed(0)} gal`}
          valueB={`${calcB.annualGallons.toFixed(0)} gal`}
          highlightLower
          lowerIsA={calcA.annualGallons < calcB.annualGallons}
        />
        <ComparisonRow
          label="Monthly Water Cost"
          valueA={`$${calcA.monthlyCost.toFixed(2)}`}
          valueB={`$${calcB.monthlyCost.toFixed(2)}`}
          highlightLower
          lowerIsA={calcA.monthlyCost < calcB.monthlyCost}
        />
        <ComparisonRow
          label="Annual Water Cost"
          valueA={`$${calcA.annualCost.toFixed(2)}`}
          valueB={`$${calcB.annualCost.toFixed(2)}`}
          highlightLower
          lowerIsA={calcA.annualCost < calcB.annualCost}
        />
        <ComparisonRow
          label="5-Year Ownership Cost"
          valueA={`$${calcA.fiveYear.toFixed(2)}`}
          valueB={`$${calcB.fiveYear.toFixed(2)}`}
          highlightLower
          lowerIsA={calcA.fiveYear < calcB.fiveYear}
        />
      </div>

      {/* Source attribution */}
      <div className="mt-6 space-y-2">
        {[productA, productB].map((p) => (
          <div key={p.id} className="text-xs text-gray-500 flex items-center gap-1">
            <Info size={12} />
            <span className="font-medium">{p.name}:</span>
            <span>Flow rate source — </span>
            {p.sourceUrl ? (
              <a
                href={p.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-0.5"
              >
                {p.source}
                <ExternalLink size={10} />
              </a>
            ) : (
              <span>{p.source}</span>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Award className="text-amber-500" />
            Recommendations
          </h3>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Leaf className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-semibold text-green-800">
                  Lowest Water Consumption: {recommendations.lowestWater.name}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  At {recommendations.lowestWater.flowRate} GPM, this product uses the least water
                  over time. You'd save approximately{' '}
                  <span className="font-semibold">{waterSavings.toFixed(0)} gallons per year</span>{' '}
                  compared to the alternative.{' '}
                  {recommendations.lowestWater.id === lowerCostProduct.id
                    ? 'It also has the lowest 5-year ownership cost — the clear winner.'
                    : `However, its 5-year ownership cost ($${fiveYearOwnershipCost(
                        recommendations.lowestWater.price,
                        recommendations.lowestWater.flowRate,
                        minutesPerDay,
                        waterRate
                      ).toFixed(2)}) is higher than the cheaper option below. Choose this if water conservation is your top priority.`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <p className="font-semibold text-amber-800">
                  Lowest 5-Year Ownership Cost: {recommendations.lowestFiveYear.name}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Over 5 years, this product costs the least overall (purchase price + water bills).
                  You'd save approximately{' '}
                  <span className="font-semibold">${costSavings.toFixed(2)} over 5 years</span>{' '}
                  compared to the alternative.{' '}
                  {recommendations.lowestFiveYear.id === lowerWaterProduct.id
                    ? 'It also uses less water — the clear winner.'
                    : `However, it uses more water (${recommendations.lowestFiveYear.flowRate} GPM vs ${lowerWaterProduct.flowRate} GPM). Choose this if upfront and total cost matter more than water conservation.`}
                </p>
              </div>
            </div>
          </div>

          {recommendations.lowestWater.id !== recommendations.lowestFiveYear.id && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShoppingBag className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Trade-Off Summary</p>
                  <p>
                    The <strong>{recommendations.lowestWater.name}</strong> saves more water but
                    costs more over 5 years. The <strong>{recommendations.lowestFiveYear.name}</strong>{' '}
                    costs less overall but uses more water. Your choice depends on whether you
                    prioritize environmental impact or total cost.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add to manual comparison */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          Want to add these to your manual calculator for custom usage scenarios?
        </p>
        <div className="flex gap-2">
          {[productA, productB].map((p) => (
            <button
              key={p.id}
              onClick={() => onAddToManualComparison(p)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add "{p.name}" to Calculator
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  valueA: string;
  valueB: string;
  highlightLower?: boolean;
  lowerIsA?: boolean;
}

function ComparisonRow({ label, valueA, valueB, highlightLower, lowerIsA }: ComparisonRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2 items-center py-2 border-b border-gray-100">
      <div className="text-sm text-gray-600">{label}</div>
      <div
        className={`text-sm font-semibold text-right ${
          highlightLower && lowerIsA ? 'text-green-700 bg-green-50 rounded px-2 py-1' : 'text-gray-800'
        }`}
      >
        {valueA}
      </div>
      <div
        className={`text-sm font-semibold text-right ${
          highlightLower && !lowerIsA ? 'text-green-700 bg-green-50 rounded px-2 py-1' : 'text-gray-800'
        }`}
      >
        {valueB}
      </div>
    </div>
  );
}
