import { useEffect, useState } from 'react';
import { LayoutDashboard, Leaf, Droplet, Camera, Calculator } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductDiscovery from './components/ProductDiscovery';
import EvidenceCenter from './components/EvidenceCenter';
import WaterCalculator from './components/WaterCalculator';
import type { ProductSpec, ProductCategory } from './types';
import type { CalculatorEntry } from './types/calculator';
import { BillProvider } from './context/BillContext';

type View = 'dashboard' | 'discovery' | 'calculator' | 'evidence';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [calculatorCategory, setCalculatorCategory] = useState<ProductCategory>('showerheads');
  const [calculatorProducts, setCalculatorProducts] = useState<CalculatorEntry[]>(() => {
    try {
      const raw = localStorage.getItem('dewaecov3_calculator_products');
      const data: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return [];
      const validCategories: ProductCategory[] = ['showerheads','faucets','toilets','washing_machines','dishwashers'];
      return data.filter((p): p is CalculatorEntry => !!p && typeof p === 'object' &&
        typeof p.id === 'string' && typeof p.name === 'string' && typeof p.brand === 'string' &&
        typeof p.source === 'string' && validCategories.includes(p.category) &&
        Number.isFinite(p.price) && p.price >= 0 && Number.isFinite(p.flowRate) && p.flowRate >= 0
      );
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('dewaecov3_calculator_products', JSON.stringify(calculatorProducts)); }
    catch { /* storage is optional */ }
  }, [calculatorProducts]);
  const handleCatalogProduct = (product: ProductSpec) => {
    setCalculatorCategory(product.category);
    setCalculatorProducts(prev => prev.some(p => p.name === product.name && p.brand === product.brand && p.category === product.category) ? prev : [...prev, {id: crypto.randomUUID(), name: product.name, brand: product.brand, category: product.category, price: product.price, flowRate: product.flowRate, source: 'Illustrative catalog item (not purchase verified)'}]);
    setView('calculator');
  };


  return (
    <BillProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-16 py-2 gap-2 flex-wrap">
              <div className="flex items-center text-teal-700">
                <Droplet className="w-6 h-6 mr-2" />
                <span className="font-bold text-lg text-slate-800">DEWAEcoApp <span className="font-normal text-xs text-slate-500">· independent prototype</span></span>
              </div>
              <nav className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setView('dashboard')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'dashboard' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                </button>
                <button
                  onClick={() => setView('discovery')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'discovery' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Leaf className="w-4 h-4 mr-1.5" /> Eco Products
                </button>
                <button
                  onClick={() => setView('calculator')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'calculator' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-4 h-4 mr-1.5" /> Water Calculator
                </button>
                <button
                  onClick={() => setView('evidence')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'evidence' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Camera className="w-4 h-4 mr-1.5" /> Scan & Review
                </button>
              </nav>
            </div>
          </div>
        </header>

        {view === 'dashboard' ? <Dashboard onScanBill={() => setView('evidence')} /> : view === 'discovery' ? <ProductDiscovery onAddToCalculator={handleCatalogProduct} /> : view === 'calculator' ? <WaterCalculator products={calculatorProducts} setProducts={setCalculatorProducts} category={calculatorCategory} onCategoryChange={setCalculatorCategory} /> : <EvidenceCenter />}
      </div>
    </BillProvider>
  );
}

export default App;
