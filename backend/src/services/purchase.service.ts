import { DataSource } from 'typeorm';
import { Coupon } from '../entities/Coupon';
import { Purchase, PurchaseChannel } from '../entities/Purchase';
import type { PurchaseResponse } from '@repo/shared';

export type PurchaseParams = {
  productId: string;
  channel: PurchaseChannel;
  /** The price submitted by the buyer */
  buyerPrice: number;
  /** Reseller ID extracted from JWT — null for direct customers */
  resellerId: string | null;
};

export type PurchaseError =
  | { code: 'PRODUCT_NOT_FOUND' }
  | { code: 'PRODUCT_ALREADY_SOLD' }
  | { code: 'RESELLER_PRICE_TOO_LOW'; minimumSellPrice: number };

export type PurchaseResult =
  | { success: true; data: PurchaseResponse }
  | { success: false; error: PurchaseError };

/**
 * Atomically purchases a coupon.
 *
 * Uses SELECT ... FOR UPDATE inside a transaction to prevent race conditions.
 * Only one concurrent request can win the lock, the other receives PRODUCT_ALREADY_SOLD.
 *
 * On success:
 *  1. Marks coupon as sold
 *  2. Logs the purchase to the purchases table
 *  3. Returns the coupon value
 */
export async function purchaseCoupon(
  dataSource: DataSource,
  params: PurchaseParams,
): Promise<PurchaseResult> {
  return dataSource.transaction(async (manager) => {
    // Lock the coupon row for this transaction to prevent race conditions
    const coupon = await manager
      .getRepository(Coupon)
      .createQueryBuilder('coupon')
      .setLock('pessimistic_write')
      .where('coupon.id = :id', { id: params.productId })
      .getOne();

    if (!coupon) {
      return { success: false, error: { code: 'PRODUCT_NOT_FOUND' } };
    }

    if (coupon.is_sold) {
      return { success: false, error: { code: 'PRODUCT_ALREADY_SOLD' } };
    }

    // For reseller channel: validate price is >= minimum_sell_price
    if (params.channel === PurchaseChannel.RESELLER) {
      const minimum = Number(coupon.minimum_sell_price);
      if (params.buyerPrice < minimum) {
        return {
          success: false,
          error: { code: 'RESELLER_PRICE_TOO_LOW', minimumSellPrice: minimum },
        };
      }
    }

    // Atomically mark as sold
    coupon.is_sold = true;
    await manager.save(Coupon, coupon);

    // Log the purchase
    const purchase = manager.getRepository(Purchase).create({
      product_id: coupon.id,
      channel: params.channel,
      price: params.buyerPrice,
      reseller_id: params.resellerId,
    });
    await manager.save(Purchase, purchase);

    return {
      success: true,
      data: {
        product_id: coupon.id,
        final_price: params.buyerPrice,
        value_type: coupon.value_type,
        value: coupon.value,
      },
    };
  });
}
