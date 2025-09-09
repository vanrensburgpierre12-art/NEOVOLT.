// Currency utility functions
export const CURRENCY_SYMBOL = 'R'
export const CURRENCY_CODE = 'ZAR'

/**
 * Format a number as South African Rand currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_SYMBOL}0.00` : '0.00'
  }
  
  const formatted = parseFloat(amount).toFixed(2)
  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted
}

/**
 * Format a number as currency with thousands separators
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted currency string with thousands separators
 */
export function formatCurrencyWithSeparators(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_SYMBOL}0.00` : '0.00'
  }
  
  const formatted = parseFloat(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted
}

/**
 * Parse a currency string back to a number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The parsed number
 */
export function parseCurrency(currencyString) {
  if (!currencyString) return 0
  
  // Remove currency symbol and any whitespace
  const cleaned = currencyString.replace(/[R\s]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}