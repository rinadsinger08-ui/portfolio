import React, { useState } from 'react';
import { ProductSpec, ProductCategory } from '../types';
import { CATEGORY_LABELS } from '../data/productCatalog';
import { USAGE_ASSUMPTIONS, WATER_COST_PER_LITRE } from '../utils/usageAssumptions';
import { calculateProductConsumption } from '../utils/productCalculations';
import { X, Droplet, Coins } from 'lucide-react';

interface ManualProductEntryProps { onAdd: (product: ProductSpec) => void; onCancel: () => void; }

const UNIT_BY_CATEGORY: Record<ProductCategory, ProductSpec['unit']> = {
  showerheads: 'L/min', faucets: 'L/min', toilets: 'L/flush', washing_machines: 'L/cycle', dishwashers: 'L/cycle',
};

const ManualProductEntry: React.FC<ManualProductEntryProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('showerheads');
  const [flowRate, setFlowRate] = useState('');
  const [price, setPrice] = useState('');
  const [specSource, setSpecSource] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const unit = UNIT_BY_CATEGORY[category];
  const assumption = USAGE_ASSUMPTIONS[category];

  const previewProduct: ProductSpec | null = name && parseFloat(flowRate) > 0 && parseFloat(price) > 0 ? {
    name, brand: brand || 'Manual entry', category, flowRate: parseFloat(flowRate), unit, price: parseFloat(price),
    specSource: specSource || 'User-entered specification', retailerSearchUrl: '', description: undefined,
  } : null;
  const preview = previewProduct ? calculateProductConsumption(previewProduct) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!flowRate || parseFloat(flowRate) <= 0) newErrors.flowRate = 'Enter a positive value';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Enter a positive price';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onAdd({ name: name.trim(), brand: brand.trim() || 'Manual entry', category, flowRate: parseFloat(flowRate), unit, price: parseFloat(price), specSource: specSource.trim() || 'User-entered specification', retailerSearchUrl: '', description: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button type="button" onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Product name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.name ? 'border-red-400' : 'border-slate-300'}`} placeholder="e.g., My current showerhead" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brand (optional)</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Grohe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Flow / use ({unit})</label>
          <input type="number" value={flowRate} onChange={(e) => setFlowRate(e.target.value)} min="0" step="0.1" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.flowRate ? 'border-red-400' : 'border-slate-300'}`} placeholder={`e.g., ${category === 'showerheads' ? '8' : '6'}`} />
          {errors.flowRate && <p className="text-red-500 text-xs mt-1">{errors.flowRate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price (AED)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.price ? 'border-red-400' : 'border-slate-300'}`} placeholder="e.g., 120" />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Source of specification (optional)</label>
        <input type="text" value={specSource} onChange={(e) => setSpecSource(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Manufacturer datasheet, store label" />
      </div>
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">Assumption: {assumption.label} · Illustrative rate: AED {(WATER_COST_PER_LITRE * 1000).toFixed(2)}/m³ (entry-tier plus Oct 2026 surcharge, before VAT; bill may differ)</div>
      {preview && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-sky-50 border border-sky-200 p-3">
            <div className="flex items-center text-sky-700 text-xs font-medium mb-1"><Droplet className="w-3.5 h-3.5 mr-1" /> Annual water</div>
            <div className="text-sm font-semibold text-slate-800">{preview.annualLiters.toLocaleString(undefined, { maximumFractionDigits: 0 })} L</div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="flex items-center text-emerald-700 text-xs font-medium mb-1"><Coins className="w-3.5 h-3.5 mr-1" /> 5-yr cost</div>
            <div className="text-sm font-semibold text-slate-800">AED {preview.fiveYearTotalCostAed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">Add to comparison</button>
      </div>
    </form>
  );
};

export default ManualProductEntry;
