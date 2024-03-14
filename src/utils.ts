export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1).trim() + '...' : str.trim();
}

export const dollar = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
