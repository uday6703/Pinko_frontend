/**
 * Format cents as currency
 */
export function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Generate client seed
 */
export function generateClientSeed() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * API base URL
 */
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://plinko-bakend-1.onrender.com'
  : 'http://localhost:5000';