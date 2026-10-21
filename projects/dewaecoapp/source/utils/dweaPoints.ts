import type { User } from '../types';

// Original Bolt prototype behavior: text matching, not actual OCR.
export function processReceiptScan(receiptText: string, user: User): User {
  const matchedItems = user.recommendedItems.filter(item =>
    receiptText.toLowerCase().includes(item.toLowerCase())
  );

  if (matchedItems.length > 0) {
    const pointsEarned = matchedItems.length * 10;
    const updatedPoints = user.dweaPoints + pointsEarned;
    alert('🎉 Receipt match! You earned ' + pointsEarned + ' DWEA points.');
    return { ...user, dweaPoints: updatedPoints };
  }

  alert('❌ No recommended items found in the receipt.');
  return user;
}

// Original Bolt prototype behavior: simulated partner purchase verification.
export function verifyPartnerPurchases(
  user: User,
  partner: 'amazon' | 'carrefour',
  purchaseHistory: string[]
): User {
  if (!user.linkedAccounts[partner]) {
    alert('🔗 ' + partner + ' account not linked.');
    return user;
  }

  const matchedItems = user.recommendedItems.filter(item =>
    purchaseHistory.some(purchase =>
      purchase.toLowerCase().includes(item.toLowerCase())
    )
  );

  if (matchedItems.length > 0) {
    const pointsEarned = matchedItems.length * 15;
    alert('🛒 You earned ' + pointsEarned + ' DWEA points from ' + partner + '!');
    return { ...user, dweaPoints: user.dweaPoints + pointsEarned };
  }

  alert('❌ No recommended items found in ' + partner + ' purchases.');
  return user;
}
