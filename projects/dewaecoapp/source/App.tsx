import React, { useState } from 'react';
import { Droplets, DollarSign, Plus, Trash2, Receipt, Link } from 'lucide-react';
import { processReceiptScan, verifyPartnerPurchases } from './utils/dweaPoints';
import { User } from './types';

interface Product {
  id: string;
  name: string;
  price: number;
  flowRate: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [averageUsageMinutes, setAverageUsageMinutes] = useState(10);
  const [waterRate, setWaterRate] = useState(0.004); // Average cost per gallon in USD
  const [user, setUser] = useState<User>({
    id: crypto.randomUUID(),
    name: 'User',
    dweaPoints: 0,
    recommendedItems: [],
    linkedAccounts: {
      amazon: false,
      carrefour: false,
    },
  });

  const addProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: '',
      price: 0,
      flowRate: 0,
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
    
    // Update recommended items when product name changes
    if (field === 'name' && typeof value === 'string' && value.trim()) {
      setUser(prevUser => ({
        ...prevUser,
        recommendedItems: [...new Set([...prevUser.recommendedItems, value.trim()])]
      }));
    }
  };

  const removeProduct = (id: string) => {
    const productToRemove = products.find(p => p.id === id);
    setProducts(products.filter(product => product.id !== id));
    
    // Remove from recommended items if product is deleted
    if (productToRemove?.name) {
      setUser(prevUser => ({
        ...prevUser,
        recommendedItems: prevUser.recommendedItems.filter(item => item !== productToRemove.name)
      }));
    }
  };

  const calculateMonthlyCost = (flowRate: number) => {
    const gallonsPerMinute = flowRate;
    const minutesPerDay = averageUsageMinutes;
    const daysPerMonth = 30;
    const totalGallons = gallonsPerMinute * minutesPerDay * daysPerMonth;
    return totalGallons * waterRate;
  };

  const calculateAnnualCost = (flowRate: number) => {
    return calculateMonthlyCost(flowRate) * 12;
  };

  const calculateTotalCost = (price: number, flowRate: number, years: number) => {
    return price + (calculateAnnualCost(flowRate) * years);
  };

  const handleReceiptScan = () => {
    // Simulated receipt scan - in a real app, this would use a camera or file upload
    const mockReceiptText = prompt('Enter receipt text to simulate scanning:');
    if (mockReceiptText) {
      setUser(prevUser => processReceiptScan(mockReceiptText, prevUser));
    }
  };

  const togglePartnerAccount = (partner: 'amazon' | 'carrefour') => {
    setUser(prevUser => ({
      ...prevUser,
      linkedAccounts: {
        ...prevUser.linkedAccounts,
        [partner]: !prevUser.linkedAccounts[partner]
      }
    }));
  };

  const checkPartnerPurchases = (partner: 'amazon' | 'carrefour') => {
    // Simulated purchase history - in a real app, this would come from the partner's API
    const mockPurchases = ['Example Purchase'];
    setUser(prevUser => verifyPartnerPurchases(prevUser, partner, mockPurchases));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Droplets className="text-blue-500" />
                Water Consumption Calculator
              </h1>
              <p className="text-gray-600">
                Compare products based on their water consumption and long-term costs
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">DWEA Points: {user.dweaPoints}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleReceiptScan()}
                  className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Receipt size={20} />
                  Scan Receipt
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Link className="text-blue-500" />
              Partner Accounts
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => togglePartnerAccount('amazon')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  user.linkedAccounts.amazon
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {user.linkedAccounts.amazon ? '✓ Amazon Connected' : 'Connect Amazon'}
              </button>
              <button
                onClick={() => togglePartnerAccount('carrefour')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  user.linkedAccounts.carrefour
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {user.linkedAccounts.carrefour ? '✓ Carrefour Connected' : 'Connect Carrefour'}
              </button>
            </div>
            {(user.linkedAccounts.amazon || user.linkedAccounts.carrefour) && (
              <div className="mt-3 flex gap-4">
                {user.linkedAccounts.amazon && (
                  <button
                    onClick={() => checkPartnerPurchases('amazon')}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Check Amazon Purchases
                  </button>
                )}
                {user.linkedAccounts.carrefour && (
                  <button
                    onClick={() => checkPartnerPurchases('carrefour')}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Check Carrefour Purchases
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Usage (minutes per day)
              </label>
              <input
                type="number"
                value={averageUsageMinutes}
                onChange={(e) => setAverageUsageMinutes(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
              />
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Rate ($ per gallon)
              </label>
              <input
                type="number"
                value={waterRate}
                onChange={(e) => setWaterRate(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                step="0.001"
              />
            </div>
          </div>

          <button
            onClick={addProduct}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mb-6"
          >
            <Plus size={20} />
            Add Product
          </button>

          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Shower Head Model X"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, 'price', Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flow Rate (GPM)
                    </label>
                    <input
                      type="number"
                      value={product.flowRate}
                      onChange={(e) => updateProduct(product.id, 'flowRate', Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {product.flowRate > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700">Monthly Water Cost</h3>
                      <p className="text-lg font-semibold text-blue-700">
                        ${calculateMonthlyCost(product.flowRate).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700">Annual Water Cost</h3>
                      <p className="text-lg font-semibold text-green-700">
                        ${calculateAnnualCost(product.flowRate).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700">5-Year Total Cost</h3>
                      <p className="text-lg font-semibold text-purple-700">
                        ${calculateTotalCost(product.price, product.flowRate, 5).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {products.length > 0 && (
            <div className="mt-8 bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-green-500" />
                Cost Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Initial Cost</th>
                      <th className="text-right p-2">Monthly Cost</th>
                      <th className="text-right p-2">Annual Cost</th>
                      <th className="text-right p-2">5-Year Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t">
                        <td className="p-2">{product.name || 'Unnamed Product'}</td>
                        <td className="text-right p-2">${product.price.toFixed(2)}</td>
                        <td className="text-right p-2">
                          ${calculateMonthlyCost(product.flowRate).toFixed(2)}
                        </td>
                        <td className="text-right p-2">
                          ${calculateAnnualCost(product.flowRate).toFixed(2)}
                        </td>
                        <td className="text-right p-2">
                          ${calculateTotalCost(product.price, product.flowRate, 5).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
