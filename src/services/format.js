export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ '
};

/**
 * Format a numeric amount based on the selected currency code.
 */
export function formatCurrency(amount, currencyCode = 'INR') {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '₹';
  const num = parseFloat(amount);
  if (isNaN(num)) return `${symbol}0`;
  
  if (currencyCode === 'INR') {
    return `${symbol}${num.toLocaleString('en-IN')}`;
  } else {
    // Other currencies use Standard Western grouping
    return `${symbol}${num.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    })}`;
  }
}
