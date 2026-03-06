import { Coupon } from '../entities/Coupon';

/**
 * Calculates the minimum sell price for a coupon.
 * Formula: minimum_sell_price = cost_price × (1 + margin_percentage / 100)
 *
 * Rules enforced here:
 *  - cost_price must be >= 0
 *  - margin_percentage must be >= 0
 */
export function calculateMinimumSellPrice(costPrice: number, marginPercentage: number): number {
  if (Number.isNaN(costPrice)) {
    throw new Error('cost_price must be a valid number');
  }
  if (Number.isNaN(marginPercentage)) {
    throw new Error('margin_percentage must be a valid number');
  }
  if (costPrice < 0) {
    throw new Error('cost_price must be >= 0');
  }
  if (marginPercentage < 0) {
    throw new Error('margin_percentage must be >= 0');
  }
  return costPrice * (1 + marginPercentage / 100);
}

/**
 * Applies the server-side calculated minimum_sell_price onto a Coupon entity.
 * Must be called before persisting any new or updated coupon.
 * Pricing fields must NOT be accepted from external clients.
 */
export function applyMinimumSellPrice(coupon: Partial<Coupon>): Partial<Coupon> {
  const cost = Number(coupon.cost_price);
  const margin = Number(coupon.margin_percentage);

  if (Number.isNaN(cost)) {
    throw new Error('cost_price is required and must be a valid number');
  }
  if (Number.isNaN(margin)) {
    throw new Error('margin_percentage is required and must be a valid number');
  }

  coupon.minimum_sell_price = calculateMinimumSellPrice(cost, margin);
  return coupon;
}
