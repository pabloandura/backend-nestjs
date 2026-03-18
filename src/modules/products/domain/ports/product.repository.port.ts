import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductFilters {
  name?: string;
  price?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string; // e.g. 'price:asc'
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  name: string;
  sku: string;
  price: number;
  imageUrl?: string;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findMany(filters: ProductFilters): Promise<PaginatedProducts>;
  create(data: CreateProductData): Promise<Product>;
  existsBySku(sku: string): Promise<boolean>;
}
