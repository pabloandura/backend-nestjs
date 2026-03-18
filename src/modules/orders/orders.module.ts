import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrderSchemaClass, OrderSchema } from './infrastructure/persistence/order.schema';
import { OrderMongooseRepository } from './infrastructure/persistence/order.mongoose-repository';
import { OrdersController } from './infrastructure/http/orders.controller';

import { ORDER_REPOSITORY } from './domain/ports/order.repository.port';

import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { UpdateOrderUseCase } from './application/use-cases/update-order.use-case';
import { OrderReportsUseCase } from './application/use-cases/order-reports.use-case';

import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderSchemaClass.name, schema: OrderSchema },
    ]),
    ProductsModule, // for PRODUCT_REPOSITORY port used in use-cases
  ],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: OrderMongooseRepository },
    CreateOrderUseCase,
    UpdateOrderUseCase,
    OrderReportsUseCase,
  ],
})
export class OrdersModule {}
