import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { UpdateOrderUseCase } from '../../application/use-cases/update-order.use-case';
import { OrderReportsUseCase } from '../../application/use-cases/order-reports.use-case';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';
import { UpdateOrderDto } from '../../application/dtos/update-order.dto';
import { ParseMongoIdPipe } from '../../../../common/pipes/parse-mongo-id.pipe';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrder: UpdateOrderUseCase,
    private readonly reports: OrderReportsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrderDto) {
    return this.createOrder.execute(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.updateOrder.execute(id, dto);
  }

  @Get('reports/total-last-month')
  @Roles(UserRole.ADMIN)
  totalLastMonth() {
    return this.reports.getTotalLastMonth();
  }

  @Get('reports/highest')
  @Roles(UserRole.ADMIN)
  highestOrder() {
    return this.reports.getHighestOrder();
  }
}
