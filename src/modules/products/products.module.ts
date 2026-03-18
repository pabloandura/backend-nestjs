import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { ProductSchemaClass, ProductSchema } from './infrastructure/persistence/product.schema';
import { ProductMongooseRepository } from './infrastructure/persistence/product.mongoose-repository';
import { LocalStorageAdapter } from './infrastructure/storage/local-storage.adapter';
import { S3StorageAdapter } from './infrastructure/storage/s3-storage.adapter';
import { ProductsController } from './infrastructure/http/products.controller';

import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';
import { STORAGE_PORT } from './domain/ports/storage.port';

import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductMongooseRepository },
    {
      provide: STORAGE_PORT,
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('storage.driver');
        return driver === 's3' ? new S3StorageAdapter() : new LocalStorageAdapter(config);
      },
      inject: [ConfigService],
    },
    CreateProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
