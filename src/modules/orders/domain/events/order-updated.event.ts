import { Order } from '../entities/order.entity';

export class OrderUpdatedEvent {
  static readonly EVENT_NAME = 'order.updated';

  constructor(public readonly order: Order) {}
}
