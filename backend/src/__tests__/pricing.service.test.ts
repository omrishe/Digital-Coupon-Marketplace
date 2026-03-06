import { calculateMinimumSellPrice } from '../services/pricing.service';

describe('calculateMinimumSellPrice', () => {
  // ─── Spec example ─────────────────────────────────────────────────────────────
  it('returns 100 for cost=80 and margin=25% (spec example)', () => {
    expect(calculateMinimumSellPrice(80, 25)).toBeCloseTo(100, 5);
  });

  // ─── Zero edge cases ──────────────────────────────────────────────────────────
  it('returns cost_price unchanged when margin is 0%', () => {
    expect(calculateMinimumSellPrice(50, 0)).toBe(50);
  });

  it('returns 0 when cost_price is 0 and margin is 0', () => {
    expect(calculateMinimumSellPrice(0, 0)).toBe(0);
  });

  it('returns 0 when cost_price is 0 regardless of margin', () => {
    expect(calculateMinimumSellPrice(0, 100)).toBe(0);
  });

  // ─── Typical pricing scenarios ────────────────────────────────────────────────
  it('correctly applies a 50% margin', () => {
    expect(calculateMinimumSellPrice(100, 50)).toBeCloseTo(150, 5);
  });

  it('correctly applies a 100% margin (doubles the price)', () => {
    expect(calculateMinimumSellPrice(50, 100)).toBeCloseTo(100, 5);
  });

  it('handles decimal cost prices', () => {
    expect(calculateMinimumSellPrice(9.99, 10)).toBeCloseTo(10.989, 3);
  });

  // ─── Validation rules ─────────────────────────────────────────────────────────
  it('throws when cost_price is negative', () => {
    expect(() => calculateMinimumSellPrice(-10, 25)).toThrow('cost_price must be >= 0');
  });

  it('throws when margin_percentage is negative', () => {
    expect(() => calculateMinimumSellPrice(50, -5)).toThrow('margin_percentage must be >= 0');
  });
});
