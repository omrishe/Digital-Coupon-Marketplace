import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './Product';

export enum PurchaseChannel {
  CUSTOMER = 'customer',
  RESELLER = 'reseller',
}

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  product_id!: string;

  // We keep a relation for referential integrity, but we query primarily by IDs
  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({
    type: 'enum',
    enum: PurchaseChannel,
  })
  channel!: PurchaseChannel;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Index()
  @Column('uuid', { nullable: true })
  reseller_id!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}
