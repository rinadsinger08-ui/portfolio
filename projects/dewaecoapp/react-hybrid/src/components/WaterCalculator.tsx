import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Droplets, Plus, Trash2, Info, ArrowDown, AlertTriangle } from 'lucide-react';
import type { ProductCategory } from '../types';
import type { CalculatorEntry } from '../types/calculator';
import { CATEGORY_LABELS } from '../data/productCatalog';
import { USAGE_ASSUMPTIONS, WATER_COST_PER_LITRE } from '../utils/usageAssumptions';
import { calculateWaterScenario } from '../utils/waterScenario';

type Props = {
  products: CalculatorEntry[];
  setProducts: React.Dispatch<React.SetStateAction<CalculatorEntry[]>>;
  category: ProductCategory;
  onCategoryChange: (next: ProductCategory) => void;
};
const useUnit: Record<ProductCategory, string> = {
  showerheads: 'litres/minute', faucets: 'litres/minute', toilets: 'litres/flush',
  washing_machines: 'litres/cycle', dishwashers: 'litres/cycle',
};
const usesUnit: Record<ProductCategory, string> = {
  showerheads: 'minutes', faucets: 'minutes', toilets: 'flushes',
  washing_machines: 'cycles', dishwashers: 'cycles',
};
const money = (n: number) => `AED ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n: number, places = 1) => n.toLocaleString(undefined, { maximumFractionDigits: places });
const fresh = (category: ProductCategory): CalculatorEntry => ({
  id: crypto.randomUUID(), name: '', brand: '', category, price: 0, flowRate: 0,
  source: 'User-entered (unverified)',
});
export default function WaterCalculator({ products, setProducts, category, onCategoryChange }: Props) {
  const [tariff, setTariff] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('dewaecov3_calculator_tariff');
      const v = raw === null ? NaN : Number(raw);
      return Number.isFinite(v) && v >= 0 ? v : WATER_COST_PER_LITRE * 1000;
    } catch { return WATER_COST_PER_LITRE * 1000; }
  });
  const [uses, setUses] = useState<Record<ProductCategory, number>>(() => ({
    showerheads: USAGE_ASSUMPTIONS.showerheads.cyclesPerMonth,
    faucets: USAGE_ASSUMPTIONS.faucets.cyclesPerMonth,
    toilets: USAGE_ASSUMPTIONS.toilets.cyclesPerMonth,
    washing_machines: USAGE_ASSUMPTIONS.washing_machines.cyclesPerMonth,
    dishwashers: USAGE_ASSUMPTIONS.dishwashers.cyclesPerMonth,
  }));
  useEffect(() => {
    try { localStorage.setItem('dewaecov3_calculator_tariff', String(tariff)); }
    catch { /* optional storage */ }
  }, [tariff]);
  const active = useMemo(() => products.filter(p => p.category === category), [products, category]);
  const validInputs = Number.isFinite(tariff) && tariff >= 0 && Number.isFinite(uses[category]) && uses[category] >= 0;
  const results = useMemo(() => active.map(product => ({
    product,
    value: validInputs && Number.isFinite(product.price) && product.price >= 0 &&
      Number.isFinite(product.flowRate) && product.flowRate >= 0 ?
      calculateWaterScenario(product.flowRate, uses[category], tariff, product.price) : null,
  })), [active, category, tariff, uses, validInputs]);
  const contenders = results.filter((r): r is typeof r & { value: NonNullable<typeof r['value']> } => !!r.value && r.product.flowRate > 0 && !!r.product.name.trim());
  const bestWater = contenders.length >= 2 ? Math.min(...contenders.map(r => r.value.annualLitres)) : null;
  const bestCost = contenders.length >= 2 ? Math.min(...contenders.map(r => r.value.fiveYearTotalCostAed)) : null;
  const sameBest = contenders.some(r => r.value.annualLitres === bestWater && r.value.fiveYearTotalCostAed === bestCost);
  const update = (id: string, field: keyof CalculatorEntry, value: string | number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const remove = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const add = () => setProducts(prev => [...prev, fresh(category)]);
  const groups = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

  return <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><Calculator className="w-8 h-8 text-teal-700"/> Water Cost Calculator</h1>
      <p className="text-slate-600 mt-1">Compare any number of products by water use and projected ownership cost. Based on your original Bolt calculator.</p></div>
      <button type="button" onClick={add} className="inline-flex items-center px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 font-semibold"><Plus className="w-4 h-4 mr-2"/> Add product</button>
    </header>
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-sm text-amber-900">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"/><p><strong>Estimates only.</strong> These results use editable usage and tariff assumptions, not your actual DEWA slab bill. Catalog items are examples and are not independently certified purchases. Comparing different appliance categories or using gallons/minute for a toilet or washing machine produces invalid results, so this calculator uses the correct unit for each category. No points are awarded here.</p>
    </div>
    <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div><h2 className="font-semibold text-lg text-slate-800 mb-3">1. Choose a product category</h2><div className="flex flex-wrap gap-2">
      {groups.map(([key, label])=><button key={key} type="button" onClick={()=>onCategoryChange(key)} className={`rounded-lg px-3 py-2 text-sm font-medium ${key===category?'bg-teal-700 text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{label} ({products.filter(p=>p.category===key).length})</button>)}
      </div></div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-slate-700">2. Monthly usage ({usesUnit[category]}/month)
          <input aria-label={`Monthly usage in ${usesUnit[category]}`} type="number" min="0" step="1" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={uses[category]} onChange={e => setUses(prev=>({...prev,[category]:Number(e.target.value)}))}/>
          <span className="block font-normal text-xs text-slate-500 mt-1">Default: {USAGE_ASSUMPTIONS[category].label}</span>
        </label>
        <label className="block text-sm font-medium text-slate-700">3. Estimated marginal water tariff (AED/m³)
          <input aria-label="Estimated water tariff per cubic metre in AED" type="number" min="0" step="0.01" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={tariff} onChange={e=>setTariff(Number(e.target.value))}/>
          <span className="block font-normal text-xs text-slate-500 mt-1">Demo default AED {(WATER_COST_PER_LITRE * 1000).toFixed(2)}/m³, before VAT and billing tiers</span>
        </label>
      </div>
      {!validInputs&&<p role="alert" className="text-red-700 text-sm">Enter finite, nonnegative usage and tariff values.</p>}
    </section>
    <section className="space-y-3">
      <h2 className="font-semibold text-lg text-slate-800">4. Products to compare · {CATEGORY_LABELS[category]}</h2>
      {!active.length?<div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500"><Droplets className="w-9 h-9 mx-auto mb-3 opacity-40"/><p>No products in this category. Add one above, or send an example here from Eco Products.</p></div>:active.map(product=>
        <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <label className="block text-xs font-medium text-slate-600 lg:col-span-4">Product name
              <input type="text" value={product.name} onChange={e=>update(product.id,'name',e.target.value)} placeholder="e.g. Low-flow showerhead" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"/>
            </label>
            <label className="block text-xs font-medium text-slate-600 lg:col-span-3">Water per use ({useUnit[category]})
              <input type="number" min="0" step="any" value={product.flowRate} onChange={e=>update(product.id,'flowRate',Number(e.target.value))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"/>
            </label>
            <label className="block text-xs font-medium text-slate-600 lg:col-span-3">Purchase price (AED)
              <input type="number" min="0" step="any" value={product.price} onChange={e=>update(product.id,'price',Number(e.target.value))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"/>
            </label>
            <div className="lg:col-span-2"><button type="button" onClick={()=>remove(product.id)} className="inline-flex items-center justify-center border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-50 w-full"><Trash2 className="w-4 h-4 mr-2"/> Remove</button></div>
          </div>
          {product.source&&<p className="text-xs text-slate-400 mt-2 flex gap-1 items-center"><Info className="w-3.5 h-3.5"/>{product.source}</p>}
        </div>
      )}
    </section>
    {contenders.length >= 2 && bestWater !== null && bestCost !== null &&
      <section className="rounded-xl bg-teal-50 border border-teal-200 p-5">
        <h2 className="text-lg font-semibold text-teal-900 mb-2 flex gap-2 items-center"><ArrowDown className="w-5 h-5"/> Recommendations</h2>
        <p className="text-sm text-teal-900">Lowest annual water use: <strong>{contenders.filter(r=>r.value.annualLitres === bestWater).map(r=>r.product.name).join(' / ')}</strong>.</p>
        <p className="text-sm text-teal-900 mt-1">Lowest estimated five-year cost: <strong>{contenders.filter(r=>r.value.fiveYearTotalCostAed === bestCost).map(r=>r.product.name).join(' / ')}</strong>.</p>
        <p className="text-xs text-teal-700 mt-2">{sameBest?'At least one product wins on both measures.':'The water-saving choice differs from the lowest-cost choice. Review the trade-off before buying.'} Equal values are reported as ties.</p>
      </section>}
    {results.length>0 && <section className="bg-white border border-slate-200 p-5 rounded-xl overflow-x-auto">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Cost comparison</h2>
      <table className="w-full text-sm min-w-[650px]"><thead><tr className="text-left border-b text-slate-500"><th className="py-3 pr-3">Product</th><th className="py-3 pr-3 text-right">Monthly water (L)</th><th className="py-3 pr-3 text-right">Annual water (L)</th><th className="py-3 pr-3 text-right">Monthly water cost</th><th className="py-3 pr-3 text-right">Five-year total</th></tr></thead>
      <tbody>{results.map(({product,value})=><tr key={product.id} className="border-b border-slate-100"><th scope="row" className="py-3 pr-3 text-left font-medium">{product.name.trim()||'Unnamed product'}</th><td className="py-3 pr-3 text-right">{value?num(value.monthlyLitres):'Invalid'}</td><td className="py-3 pr-3 text-right">{value?num(value.annualLitres):'Invalid'}</td><td className="py-3 pr-3 text-right">{value?money(value.monthlyWaterCostAed):'Invalid'}</td><td className="py-3 pr-3 text-right font-semibold">{value?money(value.fiveYearTotalCostAed):'Invalid'}</td></tr>)}</tbody></table>
    </section>}
    <p className="text-sm text-slate-500">Calculation: litres per minute/flush/cycle × matching monthly activities; monthly water cost = litres / 1,000 × assumed AED/m³. Five-year total = purchase price + 60 months of estimated water cost. Does not include electricity, repairs, installation or changing tariffs.</p>
  </main>;
}
