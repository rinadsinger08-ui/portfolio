import React from 'react';
import { ProductComparisonResult, ProductRecommendation } from '../types';
import { Droplet, Coins, Award, ExternalLink, Scale } from 'lucide-react';

interface ProductComparisonProps {
  results: ProductComparisonResult[];
  recommendation: ProductRecommendation;
  onClear: () => void;
}

const formatAed = (n: number) => `AED ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const formatL = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })} L`;

const MetricRow: React.FC<{ label: string; value: string; sub?: string; highlight?: 'water' | 'cost' | 'none'; }> = ({ label, value, sub, highlight = 'none' }) => (
  <div className="py-2.5 border-b border-slate-100 last:border-b-0">
    <div className="text-xs text-slate-500 font-medium">{label}</div>
    <div className={`text-base font-semibold mt-0.5 ${highlight === 'water' ? 'text-sky-700' : highlight === 'cost' ? 'text-emerald-700' : 'text-slate-800'}`}>{value}</div>
    {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
  </div>
);

const ProductCard: React.FC<{ result: ProductComparisonResult }> = ({ result }) => {
  const { product, consumption, isLowestWater, isLowestFiveYearCost } = result;
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap gap-2 px-4 pt-4">
        {isLowestWater && (<span className="inline-flex items-center text-xs font-medium bg-sky-100 text-sky-700 rounded-full px-2.5 py-1"><Droplet className="w-3.5 h-3.5 mr-1" /> Lowest water use</span>)}
        {isLowestFiveYearCost && (<span className="inline-flex items-center text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1"><Coins className="w-3.5 h-3.5 mr-1" /> Lowest 5-yr cost</span>)}
      </div>
      <div className="px-4 pt-3">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{product.brand}</div>
        <h3 className="text-base font-semibold text-slate-800 leading-snug">{product.name}</h3>
        {product.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{product.description}</p>}
      </div>
      <div className="px-4 py-3">
        <MetricRow label="Purchase price" value={formatAed(product.price)} />
        <MetricRow label="Water flow / use" value={`${product.flowRate} ${product.unit}`} sub={product.specSource} highlight="water" />
        <MetricRow label="Monthly water use" value={formatL(consumption.monthlyLiters)} highlight="water" />
        <MetricRow label="Annual water use" value={formatL(consumption.annualLiters)} highlight="water" />
        <MetricRow label="Five-year ownership cost" value={formatAed(consumption.fiveYearTotalCostAed)} sub={`${formatAed(product.price)} + ${formatAed(consumption.fiveYearWaterCostAed)} water`} highlight="cost" />
      </div>
      <div className="mt-auto px-4 pb-4">
        <a href={product.retailerSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-medium text-teal-700 hover:text-teal-800"><ExternalLink className="w-3.5 h-3.5 mr-1" /> View retailer search results</a>
      </div>
    </div>
  );
};

const ProductComparison: React.FC<ProductComparisonProps> = ({ results, recommendation, onClear }) => {
  if (results.length === 0) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Comparison</h2>
        <button onClick={onClear} className="text-sm text-slate-500 hover:text-slate-700 font-medium">Clear selection</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {results.map((r) => (<ProductCard key={r.product.name} result={r} />))}
      </div>
      {recommendation.lowestWater && recommendation.lowestFiveYearCost && (
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200 p-5">
          <div className="flex items-center text-teal-800 font-semibold mb-3"><Award className="w-5 h-5 mr-2" /> Recommendations</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/80 rounded-lg p-4 border border-sky-200">
              <div className="flex items-center text-sky-700 text-xs font-semibold uppercase tracking-wide mb-1"><Droplet className="w-4 h-4 mr-1" /> Best for water saving</div>
              <div className="font-semibold text-slate-800">{recommendation.lowestWater.product.brand} {recommendation.lowestWater.product.name}</div>
              <div className="text-sm text-slate-600 mt-1">{formatL(recommendation.lowestWater.consumption.annualLiters)}/yr · {formatAed(recommendation.lowestWater.consumption.fiveYearTotalCostAed)} over 5 yrs</div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-1"><Coins className="w-4 h-4 mr-1" /> Best for budget (5-yr cost)</div>
              <div className="font-semibold text-slate-800">{recommendation.lowestFiveYearCost.product.brand} {recommendation.lowestFiveYearCost.product.name}</div>
              <div className="text-sm text-slate-600 mt-1">{formatAed(recommendation.lowestFiveYearCost.consumption.fiveYearTotalCostAed)} over 5 yrs · {formatL(recommendation.lowestFiveYearCost.consumption.annualLiters)}/yr</div>
            </div>
          </div>
          <div className="mt-4 flex items-start bg-white/70 rounded-lg p-3 border border-slate-200">
            <Scale className="w-4 h-4 text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">{recommendation.tradeOff}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;
