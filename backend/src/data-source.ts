import { DataSource } from 'typeorm';
import { Product } from './entities/Product';
import { Coupon } from './entities/Coupon';
import { Purchase } from './entities/Purchase';
import { Admin } from './entities/Admin';
import { User } from './entities/User';
import 'dotenv/config';

console.log(process.env.DATABASE_URL);
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // WE ARE USING migrations instead
  logging: process.env.NODE_ENV === 'development',
  entities: [Product, Coupon, Purchase, Admin, User],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  subscribers: [],
});
