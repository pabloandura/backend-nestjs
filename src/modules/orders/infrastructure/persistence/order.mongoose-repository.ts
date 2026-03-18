import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateOrderData,
  IOrderRepository,
  TotalLastMonthResult,
  UpdateOrderData,
} from '../../domain/ports/order.repository.port';
import { Order, OrderLineItem } from '../../domain/entities/order.entity';
import { OrderDocument, OrderSchemaClass } from './order.schema';

@Injectable()
export class OrderMongooseRepository implements IOrderRepository {
  constructor(
    @InjectModel(OrderSchemaClass.name)
    private readonly model: Model<OrderDocument>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(data: CreateOrderData): Promise<Order> {
    const doc = await this.model.create(data);
    return this.toDomain(doc);
  }

  async update(id: string, data: UpdateOrderData): Promise<Order | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async getTotalLastMonth(): Promise<TotalLastMonthResult> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.model.aggregate<{ total: number }>([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const total = result[0]?.total ?? 0;
    const period = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;

    return { period, total };
  }

  async getHighestOrder(): Promise<Order | null> {
    const result = await this.model.aggregate<OrderDocument>([
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);
    if (!result.length) return null;
    return this.toDomain(result[0] as unknown as OrderDocument);
  }

  private toDomain(doc: OrderDocument): Order {
    const raw = doc as unknown as {
      _id: { toString(): string };
      clientName: string;
      items: OrderLineItem[];
      total: number;
      createdAt: Date;
      updatedAt: Date;
    };
    return new Order(
      raw._id.toString(),
      raw.clientName,
      raw.items,
      raw.total,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
