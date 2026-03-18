import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<ProductSchemaClass>;

@Schema({ timestamps: true, collection: 'products' })
export class ProductSchemaClass {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ default: null })
  imageUrl: string | null;
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);

// Indexes (mirrors the Docker init script — Mongoose ensures they exist on sync)
ProductSchema.index({ name: 'text', sku: 'text' }, { weights: { name: 10, sku: 5 } });
ProductSchema.index({ name: 1, sku: 1 });
