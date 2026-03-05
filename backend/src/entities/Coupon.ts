import { ChildEntity, Column, Check, Index } from 'typeorm';
import { Product, ProductType } from './Product';

export enum CouponValueType {
  STRING = 'STRING',
  IMAGE = 'IMAGE',
}

@ChildEntity(ProductType.COUPON)
@Check(`"cost_price" >= 0`)
@Check(`"margin_percentage" >= 0`)
export class Coupon extends Product {
  @Column('decimal', { precision: 10, scale: 2 })
  cost_price!: number;

  @Column('decimal', { precision: 5, scale: 2 })
  margin_percentage!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  minimum_sell_price!: number;

  @Column({
    type: 'enum',
    enum: CouponValueType,
    default: CouponValueType.STRING,
  })
  value_type!: CouponValueType;

  @Column('text')
  value!: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  is_sold!: boolean;
}
