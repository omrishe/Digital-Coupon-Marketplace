import request from 'supertest';
import { app } from '../index';
import { AppDataSource } from '../data-source';

/**
 * Admin API Integration Tests
 *
 * These tests run against a real database (the one in docker-compose).
 * They require DATABASE_URL and JWT_SECRET to be set (via .env or env vars).
 */

let adminToken: string;
let createdProductId: string;

beforeAll(async () => {
  // Wait for DB connection (index.ts initializes it on import, wait a moment)
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
    } catch (e: any) {
      console.error('INIT ERROR:', e);
      if (e.errors) console.error('INNER ERRORS:', e.errors);
      throw e;
    }
  }

  // Register a fresh test admin (may fail if already exists — that's fine)
  await request(app)
    .post('/admin/auth/register')
    .send({ username: 'testadmin', password: 'Test@1234' });

  const loginRes = await request(app)
    .post('/admin/auth/login')
    .send({ username: 'testadmin', password: 'Test@1234' });

  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await AppDataSource.destroy();
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe('POST /admin/auth/login', () => {
  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/admin/auth/login')
      .send({ username: 'testadmin', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error_code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/admin/auth/login').send({ username: 'testadmin' });
    expect(res.status).toBe(400);
  });
});

// ─── Products CRUD ────────────────────────────────────────────────────────────

describe('POST /admin/products', () => {
  it('creates a product and returns 201', async () => {
    const res = await request(app)
      .post('/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Amazon Coupon',
        description: 'A test coupon',
        image_url: 'https://example.com/img.png',
        cost_price: 80,
        margin_percentage: 25,
        value_type: 'STRING',
        value: 'TEST-1234',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(Number(res.body.minimum_sell_price)).toBeCloseTo(100, 1);
    expect(res.body.is_sold).toBe(false);

    createdProductId = res.body.id;
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/admin/products').send({});
    expect(res.status).toBe(401);
    expect(res.body.error_code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when cost_price is missing', async () => {
    const res = await request(app)
      .post('/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bad Coupon',
        description: 'Missing pricing',
        image_url: 'https://example.com/img.png',
        margin_percentage: 25,
        value_type: 'STRING',
        value: 'BAD-1234',
      });

    expect(res.status).toBe(400);
    expect(res.body.error_code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /admin/products', () => {
  it('returns paginated list with full details', async () => {
    const res = await request(app)
      .get('/admin/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('total_pages');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/admin/products');
    expect(res.status).toBe(401);
  });
});

describe('PUT /admin/products/:id', () => {
  it('updates the product name', async () => {
    const res = await request(app)
      .put(`/admin/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Coupon Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Coupon Name');
  });

  it('returns 404 for a non-existent product', async () => {
    const res = await request(app)
      .put('/admin/products/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.error_code).toBe('PRODUCT_NOT_FOUND');
  });
});

describe('DELETE /admin/products/:id', () => {
  it('deletes the product and returns 204', async () => {
    const res = await request(app)
      .delete(`/admin/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 after the product is deleted', async () => {
    const res = await request(app)
      .put(`/admin/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
  });
});
