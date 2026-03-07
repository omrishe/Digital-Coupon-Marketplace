import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { AppDataSource } from '../data-source';
import { Coupon } from '../entities/Coupon';
import { Purchase } from '../entities/Purchase';

/**
 * Reseller API Integration Tests
 *
 * Resellers are authenticated via a pre-issued Bearer JWT.
 * Tokens are minted directly with jwt.sign (no account required).
 * Tests require DATABASE_URL and JWT_SECRET (via .env or env vars).
 */

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_before_production';
const RESELLER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

let resellerToken: string;
let adminToken: string;

/** Helper to create a fresh unsold product via admin API */
async function createTestProduct(suffix = '') {
  const res = await request(app)
    .post('/admin/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `Reseller Test Coupon ${suffix}`,
      description: 'A coupon for reseller API tests',
      image_url: 'https://example.com/reseller-test.png',
      cost_price: 80,
      margin_percentage: 25,
      value_type: 'STRING',
      value: `RESELLER-TEST-${Date.now()}${suffix}`,
    });
  return res.body as { id: string };
}

let initializedByThisSuite = false;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      initializedByThisSuite = true;
    } catch (e: any) {
      console.error('INIT ERROR:', e);
      if (e.errors) console.error('INNER ERRORS:', e.errors);
      throw e;
    }
  }

  // Mint a reseller token directly — no account registration needed
  resellerToken = jwt.sign({ reseller_id: RESELLER_ID }, JWT_SECRET);

  // Register/login an admin to create test products
  await request(app)
    .post('/admin/auth/register')
    .send({ username: 'testadmin_reseller', password: 'Test@1234' });

  const adminLogin = await request(app)
    .post('/admin/auth/login')
    .send({ username: 'testadmin_reseller', password: 'Test@1234' });

  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  if (initializedByThisSuite && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

// ─── GET /api/v1/products ─────────────────────────────────────────────────────

describe('GET /api/v1/products', () => {
  let listTestProductId: string;

  beforeAll(async () => {
    const product = await createTestProduct('list');
    listTestProductId = product.id;
  });

  afterAll(async () => {
    if (listTestProductId) {
      await AppDataSource.getRepository(Coupon).delete(listTestProductId);
    }
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(401);
    expect(res.body.error_code).toBe('UNAUTHORIZED');
  });

  it('returns paginated list of unsold products (200)', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${resellerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('total_pages');
  });

  it('does NOT expose cost_price, margin_percentage, or coupon value', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${resellerToken}`);

    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(item).not.toHaveProperty('cost_price');
      expect(item).not.toHaveProperty('margin_percentage');
      expect(item).not.toHaveProperty('value');
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('price');
    }
  });

  it('price equals minimum_sell_price (cost_price × (1 + margin/100))', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${resellerToken}`);

    const product = res.body.data.find((p: any) => p.id === listTestProductId);
    expect(product).toBeDefined();
    // cost=80, margin=25 → min_sell_price = 80 × 1.25 = 100.00
    expect(Number(product.price)).toBeCloseTo(100.0, 1);
  });
});

// ─── GET /api/v1/products/:id ─────────────────────────────────────────────────

describe('GET /api/v1/products/:id', () => {
  let getTestProductId: string;

  beforeAll(async () => {
    const product = await createTestProduct('get');
    getTestProductId = product.id;
  });

  afterAll(async () => {
    if (getTestProductId) {
      await AppDataSource.getRepository(Coupon).delete(getTestProductId);
    }
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get(`/api/v1/products/${getTestProductId}`);
    expect(res.status).toBe(401);
  });

  it('returns 200 with public product details', async () => {
    const res = await request(app)
      .get(`/api/v1/products/${getTestProductId}`)
      .set('Authorization', `Bearer ${resellerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(getTestProductId);
    expect(res.body).toHaveProperty('price');
    expect(res.body).not.toHaveProperty('cost_price');
    expect(res.body).not.toHaveProperty('value');
  });

  it('returns 404 PRODUCT_NOT_FOUND for non-existent ID', async () => {
    const res = await request(app)
      .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${resellerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error_code).toBe('PRODUCT_NOT_FOUND');
  });
});

// ─── POST /api/v1/products/:id/purchase ──────────────────────────────────────

describe('POST /api/v1/products/:id/purchase', () => {
  let purchaseProductId: string;

  beforeAll(async () => {
    const product = await createTestProduct('purchase');
    purchaseProductId = product.id;
  });

  // No afterAll cleanup — the product will have is_sold=true and a purchase record
  // which is used by the purchases table test and the 409 test below.
  // We leave it in the DB (it will be cleaned up between test runs by the create loop).

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${purchaseProductId}/purchase`)
      .send({ reseller_price: 200 });
    expect(res.status).toBe(401);
  });

  it('returns 400 RESELLER_PRICE_TOO_LOW when price < minimum_sell_price', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${purchaseProductId}/purchase`)
      .set('Authorization', `Bearer ${resellerToken}`)
      .send({ reseller_price: 50 }); // min is 100.00

    expect(res.status).toBe(400);
    expect(res.body.error_code).toBe('RESELLER_PRICE_TOO_LOW');
  });

  it('returns 400 VALIDATION_ERROR when reseller_price is missing', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${purchaseProductId}/purchase`)
      .set('Authorization', `Bearer ${resellerToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error_code).toBe('VALIDATION_ERROR');
  });

  it('returns 200 with coupon value on successful purchase', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${purchaseProductId}/purchase`)
      .set('Authorization', `Bearer ${resellerToken}`)
      .send({ reseller_price: 120 }); // > 100.00 minimum

    expect(res.status).toBe(200);
    expect(res.body.product_id).toBe(purchaseProductId);
    expect(res.body.final_price).toBe(120);
    expect(res.body.value_type).toBe('STRING');
  });

  it('logs a record in the purchases table on success (task 5.5)', async () => {
    const purchase = await AppDataSource.getRepository(Purchase).findOne({
      where: { product_id: purchaseProductId },
    });

    expect(purchase).not.toBeNull();
    expect(purchase!.channel).toBe('reseller');
    expect(Number(purchase!.price)).toBe(120);
    expect(purchase!.reseller_id).toBe(RESELLER_ID);
  });

  it('returns 409 PRODUCT_ALREADY_SOLD on repeat purchase', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${purchaseProductId}/purchase`)
      .set('Authorization', `Bearer ${resellerToken}`)
      .send({ reseller_price: 120 });

    expect(res.status).toBe(409);
    expect(res.body.error_code).toBe('PRODUCT_ALREADY_SOLD');
  });
});
