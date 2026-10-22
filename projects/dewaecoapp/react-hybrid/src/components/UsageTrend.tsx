import React, { useState } from 'react';
import { Bill } from '../types';
import { formatMonthYear } from '../utils/helpers';

interface UsageTrendProps { bills: Bill[]; }

const UsageTrend: React.FC<UsageTrendProps> = ({ bills }) => {
  const [displayType, setDisplayType] = useState<'water' | 'energy'>('water');
  const sortedBills = [...bills].sort((a, b) => { if (a.year !== b.year) return a.year - b.year; return a.month - b.month; });
  const maxWaterUsage = Math.max(...sortedBills.map(bill => bill.waterUsage));
  const maxEnergyUsage = Math.max(...sortedBills.map(bill => bill.energyUsage));
  const currentMax = displayType === 'water' ? maxWaterUsage : maxEnergyUsage;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button className={`px-3 py-1 rounded-md text-sm font-medium ${displayType === 'water' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setDisplayType('water')}>Water Usage</button>
          <button className={`px-3 py-1 rounded-md text-sm font-medium ${displayType === 'energy' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} onClick={() => setDisplayType('energy')}>Energy Usage</button>
        </div>
      </div>
      {sortedBills.length > 0 ? (
        <div className="mt-4">
          <div className="h-64 relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
              <div>100%</div><div>75%</div><div>50%</div><div>25%</div><div>0%</div>
            </div>
            <div className="ml-16 h-full flex items-end">
              {sortedBills.map((bill, index) => {
                const usage = displayType === 'water' ? bill.waterUsage : bill.energyUsage;
                const percentage = currentMax > 0 ? (usage / currentMax) * 100 : 0;
                const barColor = displayType === 'water' ? 'bg-blue-500' : 'bg-amber-500';
                const previousBill = index > 0 ? sortedBills[index - 1] : null;
                const previousUsage = previousBill ? (displayType === 'water' ? previousBill.waterUsage : previousBill.energyUsage) : usage;
                const isDecrease = usage < previousUsage;
                return (
                  <div key={bill.id} className="flex-1 h-full flex flex-col items-center justify-end mx-1">
                    <div className="relative group w-full h-full flex items-end">
                      <div className={`${barColor} w-full rounded-t-sm transition-all duration-500 ease-in-out`} style={{ height: `${percentage}%` }}></div>
                      {isDecrease && (<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">↓</div>)}
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
                        {formatMonthYear(bill.month, bill.year)}<br />{displayType === 'water' ? `${bill.waterUsage.toLocaleString()} L` : `${bill.energyUsage.toLocaleString()} kWh`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">{new Date(bill.year, bill.month).toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-600 text-center mt-6">
            Monthly {displayType === 'water' ? 'Water' : 'Energy'} Usage Trend
            <span className="text-xs text-gray-500 block mt-1">Green indicators show months with reduced consumption</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 border border-gray-200 rounded-md"><p className="text-gray-500">Add bills to see your usage trends</p></div>
      )}
    </div>
  );
};

export default UsageTrend;
