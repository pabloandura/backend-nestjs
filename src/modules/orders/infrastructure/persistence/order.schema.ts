import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<OrderSchemaClass>;

@Schema({ _id: false })
class LineItemSchema {
  @Prop({ required: true }) productId: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) sku: string;
  @Prop({ required: true, type: Number }) priceAtPurchase: number;
  @Prop({ required: true, type: Number }) quantity: number;
  @Prop({ required: true, type: Number }) lineTotal: number;
}

@Schema({ timestamps: true, collection: 'orders' })
export class OrderSchemaClass {
  @Prop({ required: true })
  clientName: string;

  @Prop({ type: [LineItemSchema], default: [] })
  items: LineItemSchema[];

  @Prop({ required: true, type: Number })
  total: number;
}

export const OrderSchema = SchemaFactory.createForClass(OrderSchemaClass);

OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ total: -1 });
