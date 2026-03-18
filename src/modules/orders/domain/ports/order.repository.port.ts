import { Order } from '../entities/order.entity';
import { OrderLineItem } from '../entities/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface CreateOrderData {
  clientName: string;
  items: OrderLineItem[];
  total: number;
}

export interface UpdateOrderData {
  clientName?: string;
  items?: OrderLineItem[];
  total?: number;
}

export interface TotalLastMonthResult {
  period: string; // 'YYYY-MM'
  total: number;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  create(data: CreateOrderData): Promise<Order>;
  update(id: string, data: UpdateOrderData): Promise<Order | null>;
  getTotalLastMonth(): Promise<TotalLastMonthResult>;
  getHighestOrder(): Promise<Order | null>;
}
