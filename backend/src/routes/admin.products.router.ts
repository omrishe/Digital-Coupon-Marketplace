import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Coupon, CouponValueType } from '../entities/Coupon';
import { Product } from '../entities/Product';
import { applyMinimumSellPrice } from '../services/pricing.service';
import { requireAdminAuth } from '../middleware/requireAdminAuth';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import type { CreateCouponRequest, UpdateCouponRequest } from '@repo/shared';

const router = Router();

/** All admin/products routes require a valid admin JWT */
router.use(requireAdminAuth);

// ─── 4.2  POST /admin/products ───────────────────────────────────────────────

router.post(
  '/',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as CreateCouponRequest;

      // Build the entity (pricing fields computed server-side)
      const couponRepo = AppDataSource.getRepository(Coupon);
      const coupon = couponRepo.create({
        name: body.name,
        description: body.description,
        image_url: body.image_url,
        cost_price: body.cost_price,
        margin_percentage: body.margin_percentage,
        value_type: body.value_type as CouponValueType,
        value: body.value,
        is_sold: false,
      });

      // Server-side price calculation — throws on invalid/missing pricing fields
      applyMinimumSellPrice(coupon);

      const saved = await couponRepo.save(coupon);
      res.status(201).json(saved);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      throw new AppError(400, 'VALIDATION_ERROR', message);
    }
  }),
);

// ─── 4.3  GET /admin/products  (paginated, full details) ─────────────────────

router.get(
  '/',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    const [products, total] = await AppDataSource.getRepository(Product).findAndCount({
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    res.json({
      data: products,
      page,
      total_pages: Math.ceil(total / limit),
    });
  }),
);

// ─── 4.4  PUT /admin/products/:id ────────────────────────────────────────────

router.put(
  '/:id',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const couponRepo = AppDataSource.getRepository(Coupon);
    const coupon = await couponRepo.findOneBy({ id: String(req.params.id) });

    if (!coupon) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    const updates = req.body as UpdateCouponRequest;

    // Allow name/description/image and unsold pricing updates
    if (updates.name !== undefined) coupon.name = updates.name;
    if (updates.description !== undefined) coupon.description = updates.description;
    if (updates.image_url !== undefined) coupon.image_url = updates.image_url;

    if (!coupon.is_sold) {
      if (updates.cost_price !== undefined) coupon.cost_price = updates.cost_price;
      if (updates.margin_percentage !== undefined)
        coupon.margin_percentage = updates.margin_percentage;
      if (updates.value_type !== undefined)
        coupon.value_type = updates.value_type as CouponValueType;
      if (updates.value !== undefined) coupon.value = updates.value;
      // Recalculate price if any pricing field changed
      if (updates.cost_price !== undefined || updates.margin_percentage !== undefined) {
        applyMinimumSellPrice(coupon);
      }
    }

    try {
      const saved = await couponRepo.save(coupon);
      res.json(saved);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      throw new AppError(400, 'VALIDATION_ERROR', message);
    }
  }),
);

// ─── 4.5  DELETE /admin/products/:id ─────────────────────────────────────────

router.delete(
  '/:id',
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOneBy({ id: String(req.params.id) });

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    await repo.remove(product);
    res.status(204).send();
  }),
);

export default router;
