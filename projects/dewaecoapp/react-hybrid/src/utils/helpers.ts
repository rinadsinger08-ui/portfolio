export const calculatePointsForReduction = (waterReduction: number, energyReduction: number): number => {
  const waterPoints = Math.max(0, Math.floor(waterReduction / 50));
  const energyPoints = Math.max(0, Math.floor(energyReduction / 10));
  return waterPoints + energyPoints;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatMonthYear = (month: number, year: number): string => {
  return new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getChangeColor = (percentChange: number): string => {
  if (percentChange < 0) return 'text-green-500';
  if (percentChange > 0) return 'text-red-500';
  return 'text-gray-500';
};

export const getAchievementIconClasses = (achievementType: string): string => {
  switch (achievementType) {
    case 'droplet': return 'bg-blue-100 text-blue-600';
    case 'zap': return 'bg-amber-100 text-amber-600';
    case 'award': return 'bg-purple-100 text-purple-600';
    case 'trending-down': return 'bg-green-100 text-green-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const formatUsage = (type: 'water' | 'energy', value: number): string => {
  if (type === 'water') {
    return `${value.toLocaleString()} L`;
  } else {
    return `${value.toLocaleString()} kWh`;
  }
};
