import { Inject, Injectable } from '@nestjs/common';
import {
  IProductRepository,
  PaginatedProducts,
  PRODUCT_REPOSITORY,
} from '../../domain/ports/product.repository.port';
import { ProductQueryDto } from '../dtos/product-query.dto';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: ProductQueryDto): Promise<PaginatedProducts> {
    return this.productRepository.findMany({
      name: query.name,
      price: query.price,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort: query.sort,
    });
  }
}
