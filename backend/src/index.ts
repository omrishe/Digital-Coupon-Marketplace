import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { AppDataSource } from './data-source';
import adminAuthRouter from './routes/admin.auth.router';
import adminProductsRouter from './routes/admin.products.router';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const port = process.env.PORT || 3000;

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Digital Coupon Marketplace API' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/admin/auth', adminAuthRouter);
app.use('/admin/products', adminProductsRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  AppDataSource.initialize()
    .then(() => {
      console.log('Database connected');
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
