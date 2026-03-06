import { DataSource } from 'typeorm';
import { Product } from './entities/Product';
import { Coupon } from './entities/Coupon';
import { Purchase } from './entities/Purchase';
import { Admin } from './entities/Admin';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL || 'postgres://coupon_user:coupon_password@localhost:5432/coupon_db',
  synchronize: false, // We will use migrations instead
  logging: process.env.NODE_ENV === 'development',
  entities: [Product, Coupon, Purchase, Admin],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  subscribers: [],
});
