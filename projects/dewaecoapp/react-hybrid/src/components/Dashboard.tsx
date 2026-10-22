import React from 'react';
import { useBills } from '../context/BillContext';
import UsageTrend from './UsageTrend';
import PointsSummary from './PointsSummary';
import BillComparison from './BillComparison';
import { formatMonthYear } from '../utils/helpers';
import { Camera, DropletIcon, Zap } from 'lucide-react';


const Dashboard: React.FC<{onScanBill: () => void}> = ({onScanBill}) => {
  const { bills, getLatestBill, hypotheticalPoints } = useBills();
  const latestBill = getLatestBill();


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utility Tracker</h1>
          <p className="text-gray-600 mt-1">Track utility usage (local prototype — points require independent verification)</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button onClick={onScanBill} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Camera className="w-5 h-5 mr-2" /> Scan a utility bill
          </button>
        </div>
      </div>

      <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">Camera-scanned bills produce local tracking records, not verified utility evidence. The +10 water / +10 electricity points rule is hypothetical, not authorized by DEWA.</p>
      <PointsSummary hypotheticalPoints={hypotheticalPoints} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Usage</h2>
            {latestBill ? (
              <div>
                <div className="text-sm text-gray-500 mb-2">{formatMonthYear(latestBill.month, latestBill.year)}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <DropletIcon className="w-10 h-10 text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Water</div>
                      <div className="text-xl font-semibold">{(latestBill.waterUsage/1000).toLocaleString()} m³</div>
                      <div className="text-sm font-medium text-gray-600">AED {latestBill.waterCost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <Zap className="w-10 h-10 text-amber-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500">Energy</div>
                      <div className="text-xl font-semibold">{latestBill.energyUsage.toLocaleString()} kWh</div>
                      <div className="text-sm font-medium text-gray-600">AED {latestBill.energyCost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (<p className="text-gray-500">No bills recorded. Scan your first utility bill to get started!</p>)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Comparison</h2>
            {latestBill ? (<BillComparison month={latestBill.month} year={latestBill.year} />) : (<p className="text-gray-500">Scan consecutive months to compare usage</p>)}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Usage Trends</h2>
          <UsageTrend bills={bills} />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Conservation Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium text-blue-800 flex items-center"><DropletIcon className="w-5 h-5 mr-2" /> Water Saving Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li>• Fix leaky faucets and pipes to save up to 110 gallons monthly</li>
                <li>• Install water-efficient showerheads to reduce usage by 2,700 gallons yearly</li>
                <li>• Run full loads in dishwashers and washing machines</li>
                <li>• Water plants during cooler hours to minimize evaporation</li>
              </ul>
            </div>
            <div className="border border-amber-100 rounded-lg p-4 bg-amber-50">
              <h3 className="font-medium text-amber-800 flex items-center"><Zap className="w-5 h-5 mr-2" /> Energy Saving Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                <li>• Replace incandescent bulbs with LEDs to save up to 75% in lighting costs</li>
                <li>• Unplug electronics when not in use to reduce phantom energy use</li>
                <li>• Use programmable thermostats to optimize heating and cooling</li>
                <li>• Seal windows and doors to prevent heating/cooling loss</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
