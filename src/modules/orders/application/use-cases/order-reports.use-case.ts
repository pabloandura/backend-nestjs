import { Inject, Injectable } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
  TotalLastMonthResult,
} from '../../domain/ports/order.repository.port';
import { Order } from '../../domain/entities/order.entity';

@Injectable()
export class OrderReportsUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  getTotalLastMonth(): Promise<TotalLastMonthResult> {
    return this.orderRepository.getTotalLastMonth();
  }

  getHighestOrder(): Promise<Order | null> {
    return this.orderRepository.getHighestOrder();
  }
}
