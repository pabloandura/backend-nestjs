import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../domain/ports/product.repository.port';
import { IStoragePort, STORAGE_PORT } from '../../domain/ports/storage.port';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(STORAGE_PORT)
    private readonly storage: IStoragePort,
  ) {}

  async execute(dto: CreateProductDto, file?: Express.Multer.File): Promise<Product> {
    const skuTaken = await this.productRepository.existsBySku(dto.sku);
    if (skuTaken) {
      throw new ConflictException(`SKU "${dto.sku}" is already in use`);
    }

    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.storage.save(file);
    }

    return this.productRepository.create({
      name: dto.name,
      sku: dto.sku,
      price: dto.price,
      imageUrl,
    });
  }
}
