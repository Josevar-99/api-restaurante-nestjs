import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Category } from '../../categories/entities/category.entity.js';

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum ProductAvailability {
    AVAILABLE = 'AVAILABLE',
    UNAVAILABLE = 'UNAVAILABLE',
}

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: { to: (v?: number) => v, from: (v: string) => parseFloat(v) }, // NUEVO: devuelve number, no string
    })
    price: number;

    @ManyToOne(() => Category, { eager: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'category_id' })
    categoryId: string;

    @Column({
        type: 'enum',
        enum: ProductAvailability,
        default: ProductAvailability.AVAILABLE,
    })
    availability: ProductAvailability;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
    })
    status: ProductStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}