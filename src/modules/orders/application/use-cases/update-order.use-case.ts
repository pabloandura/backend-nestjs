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
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { Order } from '../../domain/entities/order.entity';
import { OrderUpdatedEvent } from '../../domain/events/order-updated.event';

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateOrderDto): Promise<Order> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    let lineItems = existing.items;
    let total = existing.total;

    if (dto.items) {
      lineItems = await Promise.all(
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
      total = Math.round(lineItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
    }

    const updated = await this.orderRepository.update(id, {
      clientName: dto.clientName,
      items: lineItems,
      total,
    });

    if (!updated) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    this.eventEmitter.emit(
      OrderUpdatedEvent.EVENT_NAME,
      new OrderUpdatedEvent(updated),
    );

    return updated;
  }
}
