import { Order } from '../entities/order.entity';

export class OrderCreatedEvent {
  static readonly EVENT_NAME = 'order.created';

  constructor(public readonly order: Order) {}
}
