import React, { useMemo, useState } from 'react';
import { ProductSpec, ProductCategory, ProductComparisonResult } from '../types';
import { CATEGORY_LABELS, searchDemoCatalog, buildRetailerSearchUrl } from '../data/productCatalog';
import { USAGE_ASSUMPTIONS, WATER_COST_PER_LITRE } from '../utils/usageAssumptions';
import { compareProducts, buildRecommendation } from '../utils/productCalculations';
import ProductComparison from './ProductComparison';
import ManualProductEntry from './ManualProductEntry';
import { Search, PlusCircle, Info, FlaskConical, ExternalLink, CheckCircle2, ShoppingCart } from 'lucide-react';

const MAX_COMPARE = 2;
const formatAed = (n: number) => `AED ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const ProductDiscovery: React.FC<{ onAddToCalculator: (product: ProductSpec) => void }> = ({ onAddToCalculator }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [selected, setSelected] = useState<ProductSpec[]>([]);
  const [manualProducts, setManualProducts] = useState<ProductSpec[]>([]);
  const [showManual, setShowManual] = useState(false);

  const searchResults = useMemo(() => searchDemoCatalog(query, activeCategory), [query, activeCategory]);

  const comparisonPool = useMemo(() => {
    const pool = manualProducts.slice(-MAX_COMPARE);
    selected.forEach((s) => { if (pool.length < MAX_COMPARE && !pool.some((p) => p.name === s.name && p.brand === s.brand)) pool.push(s); });
    return pool;
  }, [selected, manualProducts]);

  const comparisonResults: ProductComparisonResult[] = useMemo(() => compareProducts(comparisonPool), [comparisonPool]);
  const recommendation = useMemo(() => buildRecommendation(comparisonResults), [comparisonResults]);

  const toggleSelect = (product: ProductSpec) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.name === product.name && p.brand === product.brand);
      if (exists) return prev.filter((p) => p !== exists);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  };

  const isSelected = (product: ProductSpec) => selected.some((p) => p.name === product.name && p.brand === product.brand);
  const isDisabled = (product: ProductSpec) => !isSelected(product) && selected.length >= MAX_COMPARE;
  const clearSelection = () => setSelected([]);

  const handleAddManual = (product: ProductSpec) => {
    setManualProducts((prev) => [...prev.slice(-(MAX_COMPARE - 1)), product]);
    setSelected((prev) => prev.length < MAX_COMPARE ? [...prev, product] : prev);
    setShowManual(false);
  };

  const selectedCount = comparisonPool.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Eco Product Discovery</h1>
          <p className="text-slate-600 mt-1">Search water-efficient products and compare two side by side</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button onClick={() => setShowManual(true)} className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            <PlusCircle className="w-5 h-5 mr-2" /> Add product manually
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex items-start">
        <FlaskConical className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Demonstration data.</span> Product names, prices, and water-flow specs below are fictional illustrative values, even where catalog descriptions reference manufacturer datasheets.  We do not scrape retailer pages, invent specifications, or expose API credentials. Links open retailer <em>search results</em> so you can verify live pricing yourself. When an authorized Amazon or Carrefour product-data integration becomes available, this catalog will pull verified data automatically.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a product category, e.g. showerheads, faucets, toilets…" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All categories</button>
          {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{CATEGORY_LABELS[cat]}</button>
          ))}
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2" />
            <span className="font-medium">{selectedCount}</span>
            <span className="text-slate-500 ml-1">/ {MAX_COMPARE} selected for comparison</span>
          </div>
          <button onClick={clearSelection} className="text-sm text-slate-500 hover:text-slate-700 font-medium">Clear all</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {searchResults.map((product) => {
          const selected = isSelected(product);
          const disabled = isDisabled(product);
          const monthly = product.flowRate * USAGE_ASSUMPTIONS[product.category].cyclesPerMonth;
          const annual = monthly * 12;
          const fiveYearCost = product.price + annual * 5 * WATER_COST_PER_LITRE;
          return (
            <div key={product.name} className={`rounded-xl bg-white border transition-all flex flex-col ${selected ? 'border-teal-500 ring-2 ring-teal-200' : disabled ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:shadow-md'}`}>
              <div className="p-4 flex-1">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{product.brand}</div>
                <h3 className="text-base font-semibold text-slate-800 leading-snug mt-0.5">{product.name}</h3>
                {product.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{product.description}</p>}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="rounded-lg bg-sky-50 py-2"><div className="text-xs text-sky-600 font-medium">Flow</div><div className="text-sm font-semibold text-slate-800">{product.flowRate} {product.unit}</div></div>
                  <div className="rounded-lg bg-teal-50 py-2"><div className="text-xs text-teal-600 font-medium">Price</div><div className="text-sm font-semibold text-slate-800">{formatAed(product.price)}</div></div>
                  <div className="rounded-lg bg-emerald-50 py-2"><div className="text-xs text-emerald-600 font-medium">5-yr</div><div className="text-sm font-semibold text-slate-800">{formatAed(fiveYearCost)}</div></div>
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-start"><Info className="w-3.5 h-3.5 mr-1 mt-0.5 flex-shrink-0" /><span>{product.specSource}</span></div>
              </div>
              <div className="px-4 pb-4 flex items-center justify-between gap-2">
                <a href={product.retailerSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-medium text-teal-700 hover:text-teal-800"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Search retailer</a>
                <button onClick={() => onAddToCalculator(product)} className="text-xs font-medium px-2 py-1.5 border border-teal-200 text-teal-700 rounded-md hover:bg-teal-50" title="Send this example to the editable Water Cost Calculator">To calculator</button>
                <button onClick={() => toggleSelect(product)} disabled={disabled} className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${selected ? 'bg-teal-600 text-white' : disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{selected ? 'Selected' : 'Compare'}</button>
              </div>
            </div>
          );
        })}
      </div>

      {searchResults.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p>No demo products match your search.</p>
          <p className="text-sm mt-1">Try a different category or add a product manually.</p>
        </div>
      )}

      {comparisonResults.length > 0 && (
        <ProductComparison results={comparisonResults} recommendation={recommendation} onClear={clearSelection} />
      )}

      {query.trim() && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center text-slate-700 font-medium text-sm mb-2"><ShoppingCart className="w-4 h-4 mr-2" /> Search retailers for &ldquo;{query.trim()}&rdquo;</div>
          <p className="text-xs text-slate-500 mb-3">These links open retailer search pages — we do not track or scrape the results.</p>
          <div className="flex flex-wrap gap-2">
            <a href={buildRetailerSearchUrl(query.trim())} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 bg-white border border-slate-200 rounded-md px-3 py-1.5"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Amazon.ae</a>
            <a href={`https://www.carrefouruae.com/ma-en/search?q=${encodeURIComponent(query.trim())}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 bg-white border border-slate-200 rounded-md px-3 py-1.5"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Carrefour UAE</a>
          </div>
        </div>
      )}

      {showManual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-semibold mb-1 text-slate-800">Add product manually</h2>
            <p className="text-sm text-slate-500 mb-4">Enter the specs from a product label or datasheet. This is the fallback when a verified catalog entry isn&apos;t available.</p>
            <ManualProductEntry onAdd={handleAddManual} onCancel={() => setShowManual(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDiscovery;
