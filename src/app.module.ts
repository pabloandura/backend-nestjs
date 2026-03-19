import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

import { UserOrmEntity } from './modules/auth/infrastructure/persistence/user.orm-entity';
import { RefreshTokenOrmEntity } from './modules/auth/infrastructure/persistence/refresh-token.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // PostgreSQL — Auth data
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('postgres.host'),
        port: config.get<number>('postgres.port'),
        username: config.get<string>('postgres.user'),
        password: config.get<string>('postgres.password'),
        database: config.get<string>('postgres.db'),
        entities: [UserOrmEntity, RefreshTokenOrmEntity],
        synchronize: config.get<string>('nodeEnv') !== 'production',
        ssl:
          config.get<string>('nodeEnv') === 'production'
            ? { rejectUnauthorized: true }
            : false,
      }),
    }),

    // MongoDB — Products and Orders data
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.uri'),
      }),
    }),

    // Rate limiting — 100 req / 60s globally; auth endpoints override to 5 req / 60s
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),

    // Internal domain events
    EventEmitterModule.forRoot(),

    CommonModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
