import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Coupon } from '../entities/Coupon';
import { requireResellerAuth } from '../middleware/requireResellerAuth';
import { purchaseCoupon } from '../services/purchase.service';
import { PurchaseChannel } from '../entities/Purchase';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import type { ResellerJwtPayload, PublicProduct, PurchaseRequest } from '@repo/shared';

const router = Router();

/** All reseller product routes require a valid reseller JWT */
router.use(requireResellerAuth);

// ─── 5.2  GET /api/v1/products  (paginated, unsold only, no sensitive data) ──

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
      price: Number(c.minimum_sell_price),
    }));

    res.json({
      data,
      page,
      total_pages: Math.ceil(total / limit),
    });
  }),
);

// ─── 5.3  GET /api/v1/products/:id ───────────────────────────────────────────

router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const coupon = await AppDataSource.getRepository(Coupon).findOneBy({
      id: String(req.params.id),
    });

    if (!coupon) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    const product: PublicProduct = {
      id: coupon.id,
      name: coupon.name,
      description: coupon.description,
      image_url: coupon.image_url,
      price: Number(coupon.minimum_sell_price),
    };

    res.json(product);
  }),
);

// ─── 5.4  POST /api/v1/products/:id/purchase ─────────────────────────────────

router.post(
  '/:id/purchase',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const resellerId = req.reseller?.reseller_id;
    const { reseller_price } = req.body as PurchaseRequest;

    if (reseller_price === undefined || reseller_price === null || isNaN(Number(reseller_price))) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'reseller_price is required and must be a number',
      );
    }

    const result = await purchaseCoupon(AppDataSource, {
      productId: String(req.params.id),
      channel: PurchaseChannel.RESELLER,
      buyerPrice: Number(reseller_price),
      resellerId,
    });

    if (!result.success) {
      const err = result.error;
      if (err.code === 'PRODUCT_NOT_FOUND') {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }
      if (err.code === 'PRODUCT_ALREADY_SOLD') {
        throw new AppError(409, 'PRODUCT_ALREADY_SOLD', 'This product has already been sold');
      }
      if (err.code === 'RESELLER_PRICE_TOO_LOW') {
        throw new AppError(
          400,
          'RESELLER_PRICE_TOO_LOW',
          `reseller_price must be >= ${err.minimumSellPrice}`,
        );
      }
    }

    res.json(result.success ? result.data : undefined);
  }),
);

export default router;
