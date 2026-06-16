// Exchange rates
export const COINS_PER_EUR = 1.75;
// Fixed USD→EUR mid-market rate (update periodically if needed)
export const USD_TO_EUR = 0.92;
export const USD_TO_COINS = USD_TO_EUR * COINS_PER_EUR; // ≈ 1.61

/** Convert a USD amount to in-game coins */
export function usdToCoins(usd: number): number {
  return +(usd * USD_TO_COINS).toFixed(2);
}

/** Format a coin amount for display (e.g. "17.50") */
export function fmtCoins(coins: number): string {
  return coins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
