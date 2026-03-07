import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { AppDataSource } from './data-source';
import { runSeed } from './seed';
import adminAuthRouter from './routes/admin.auth.router';
import adminProductsRouter from './routes/admin.products.router';
import resellerProductsRouter from './routes/reseller.products.router';
import customerProductsRouter from './routes/customer.products.router';
import customerAuthRouter from './routes/customer.auth.router';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const port = process.env.PORT || 3000;

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173'],
    credentials: true,
  }),
);
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Digital Coupon Marketplace API' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/admin/auth', adminAuthRouter);
app.use('/admin/products', adminProductsRouter);
app.use('/api/v1/products', resellerProductsRouter);
app.use('/api/v1/store/auth', customerAuthRouter);
app.use('/api/v1/store/products', customerProductsRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  AppDataSource.initialize()
    .then(async () => {
      console.log('Database connected');

      try {
        console.log('Running pending migrations...');
        await AppDataSource.runMigrations();
        console.log('Migrations complete.');

        await runSeed();
      } catch (err) {
        console.error('Initialization error (migrations/seeding):', err);
      }

      app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to database:', err);
      process.exit(1);
    });
}

export { app };
