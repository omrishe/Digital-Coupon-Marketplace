import { AppDataSource } from './data-source';
import { Admin } from './entities/Admin';
import { User } from './entities/User';
import { Coupon, CouponValueType } from './entities/Coupon';
import bcrypt from 'bcrypt';
import 'dotenv/config';

export async function runSeed() {
  const adminRepo = AppDataSource.getRepository(Admin);
  const userRepo = AppDataSource.getRepository(User);
  const couponRepo = AppDataSource.getRepository(Coupon);

  const adminCount = await adminRepo.count();
  const userCount = await userRepo.count();
  const couponCount = await couponRepo.count();

  if (adminCount === 0 && userCount === 0 && couponCount === 0) {
    console.log('Database is empty. Seeding...');

    const defaultPassword = process.env.Default_Password || '0000';
    if (!defaultPassword) {
      console.error('ERROR: Default_Password is not defined for seeding');
      return;
    }
    const passwordHash = await bcrypt.hash(defaultPassword, 12); // admin-auth.service uses 12, user uses 10

    // 1. Create Admin
    const admin = adminRepo.create({
      username: 'admin',
      password_hash: passwordHash,
    });
    await adminRepo.save(admin);
    console.log('Admin seeded with default password.');

    // 2. Create Users (Reseller and Customer)
    const userHash = await bcrypt.hash(defaultPassword, 10);
    const reseller = userRepo.create({
      username: 'reseller',
      password_hash: userHash,
    });
    const customer = userRepo.create({
      username: 'customer',
      password_hash: userHash,
    });
    await userRepo.save([reseller, customer]);
    console.log('Users (reseller, customer) seeded with default password.');

    // 3. Create Coupons
    const couponsData = [
      {
        name: '$10 Amazon Gift Card',
        description: 'Get $10 to spend on Amazon.com',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        cost_price: 8.0,
        margin_percentage: 10, // 10%
        value_type: CouponValueType.STRING,
        value: 'AMZN-10-GIFT-1234',
        minimum_sell_price: 8.8, // 8.0 + 10%
      },
      {
        name: '50% Off Starbucks',
        description: 'Half price on your next Starbucks order',
        image_url:
          'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
        cost_price: 2.0,
        margin_percentage: 20, // 20%
        value_type: CouponValueType.STRING,
        value: 'SBUX-50-OFF-5678',
        minimum_sell_price: 2.4, // 2.0 + 20%
      },
    ];

    const coupons = couponsData.map((c) => couponRepo.create(c));
    await couponRepo.save(coupons);
    console.log('Coupons seeded.');
  } else {
    console.log('Database already contains data. Skipping seed.');
  }
}
