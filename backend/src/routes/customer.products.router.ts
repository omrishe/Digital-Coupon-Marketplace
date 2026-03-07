import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Coupon } from '../entities/Coupon';
import { purchaseCoupon } from '../services/purchase.service';
import { PurchaseChannel } from '../entities/Purchase';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { requireUserToken } from '../middleware/requireUserToken';
import type { PublicProduct } from '@repo/shared';

const router = Router();

// ─── GET /api/v1/store/products ──────────────────────────────────────────────
// Public endpoint for direct customers to view available products.

router.get(
  '/',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    const [coupons, total] = await AppDataSource.getRepository(Coupon).findAndCount({
      where: { is_sold: false },
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    const data: PublicProduct[] = coupons.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image_url: c.image_url,
      // Direct customers see the minimum sell price exactly
      price: Number(c.minimum_sell_price),
    }));

    res.json({
      data,
      page,
      total_pages: Math.ceil(total / limit),
    });
  }),
);

// ─── POST /api/v1/store/products/:id/purchase ────────────────────────────────
// Public endpoint for direct customers to purchase a product.
// Customers purchase exactly at the minimum_sell_price. No overrides allowed.

router.post(
  '/:id/purchase',
  requireUserToken,
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. Fetch the product to determine the exact price they must pay
    const coupon = await AppDataSource.getRepository(Coupon).findOneBy({
      id: String(req.params.id),
    });

    if (!coupon) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    if (coupon.is_sold) {
      throw new AppError(409, 'PRODUCT_ALREADY_SOLD', 'This product has already been sold');
    }

    const exactPrice = Number(coupon.minimum_sell_price);

    // 2. Execute the purchase at the exact minimum sell price
    const result = await purchaseCoupon(AppDataSource, {
      productId: coupon.id,
      channel: PurchaseChannel.CUSTOMER,
      buyerPrice: exactPrice,
    });

    if (!result.success) {
      const err = result.error;
      if (err.code === 'PRODUCT_NOT_FOUND') {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }
      if (err.code === 'PRODUCT_ALREADY_SOLD') {
        throw new AppError(409, 'PRODUCT_ALREADY_SOLD', 'This product has already been sold');
      }
      // RESELLER_PRICE_TOO_LOW shouldn't happen since we pass exactPrice
      throw new AppError(500, 'INTERNAL_ERROR', 'Purchase failed unexpectedly');
    }

    res.json(result.data);
  }),
);

export default router;
