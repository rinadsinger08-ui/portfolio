import React from 'react';
import { useBills } from '../context/BillContext';
import { formatMonthYear, getChangeColor } from '../utils/helpers';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface BillComparisonProps { month: number; year: number; }

const BillComparison: React.FC<BillComparisonProps> = ({ month, year }) => {
  const { getMonthlyComparison } = useBills();
  const comparison = getMonthlyComparison(month, year);

  if (!comparison || !comparison.previousMonth) {
    return (<div className="text-center p-4 border border-gray-200 rounded-lg"><p className="text-gray-500">Add more bills to see month-to-month comparison</p></div>);
  }

  const { currentMonth, previousMonth, waterChange, energyChange, pointsEarned } = comparison;
  const isWaterImprovement = waterChange < 0;
  const isEnergyImprovement = energyChange < 0;

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <span>Current: {formatMonthYear(currentMonth.month, currentMonth.year)}</span>
        <span>Previous: {formatMonthYear(previousMonth.month, previousMonth.year)}</span>
      </div>
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-1a7 7 0 100-14 7 7 0 000 14z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3a1 1 0 01-.293-.707V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-gray-700 font-medium">Water Usage</div>
                <div className="text-sm text-gray-500">{currentMonth.waterUsage.toLocaleString()} L vs {previousMonth.waterUsage.toLocaleString()} L</div>
              </div>
            </div>
            <div className={`flex items-center ${getChangeColor(waterChange)}`}>
              {isWaterImprovement ? <TrendingDown className="w-5 h-5 mr-1" /> : <TrendingUp className="w-5 h-5 mr-1" />}
              <span className="font-medium">{Math.abs(waterChange).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${isWaterImprovement ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, 50 + Math.abs(waterChange) / 2)}%`, transition: 'width 1s ease-in-out' }}></div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-gray-700 font-medium">Energy Usage</div>
                <div className="text-sm text-gray-500">{currentMonth.energyUsage.toLocaleString()} kWh vs {previousMonth.energyUsage.toLocaleString()} kWh</div>
              </div>
            </div>
            <div className={`flex items-center ${getChangeColor(energyChange)}`}>
              {isEnergyImprovement ? <TrendingDown className="w-5 h-5 mr-1" /> : <TrendingUp className="w-5 h-5 mr-1" />}
              <span className="font-medium">{Math.abs(energyChange).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${isEnergyImprovement ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, 50 + Math.abs(energyChange) / 2)}%`, transition: 'width 1s ease-in-out' }}></div>
          </div>
        </div>
        {pointsEarned > 0 && (
          <div className="bg-green-50 rounded-lg p-4 text-center animate-pulse">
            <div className="text-green-800 font-medium">hypothetical conservation score: +{pointsEarned} simulated points. No rewards have been issued; proof must be verified.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillComparison;
