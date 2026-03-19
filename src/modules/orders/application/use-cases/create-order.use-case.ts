import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/ports/order.repository.port';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../products/domain/ports/product.repository.port';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../../domain/entities/order.entity';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateOrderDto): Promise<Order> {
    // Validate all products exist and build line items with price snapshots
    const lineItems = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Product with id "${item.productId}" not found`,
          );
        }
        const lineTotal = Math.round(product.price * item.quantity * 100) / 100;
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          priceAtPurchase: product.price,
          quantity: item.quantity,
          lineTotal,
        };
      }),
    );

    const total = Math.round(lineItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;

    const order = await this.orderRepository.create({
      clientName: dto.clientName,
      items: lineItems,
      total,
    });

    this.eventEmitter.emit(OrderCreatedEvent.EVENT_NAME, new OrderCreatedEvent(order));

    return order;
  }
}
