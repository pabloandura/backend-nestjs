import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateProductData,
  IProductRepository,
  PaginatedProducts,
  ProductFilters,
} from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { ProductDocument, ProductSchemaClass } from './product.schema';

@Injectable()
export class ProductMongooseRepository implements IProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly model: Model<ProductDocument>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findMany(filters: ProductFilters): Promise<PaginatedProducts> {
    const { page = 1, limit = 20, sort, search, name, price } = filters;
    const query: Record<string, unknown> = {};

    if (search) {
      query['$text'] = { $search: search };
    } else {
      if (name) query['name'] = name;
      if (price !== undefined) query['price'] = price;
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort) {
      const [field, dir] = sort.split(':');
      sortObj = { [field]: dir === 'desc' ? -1 : 1 };
    } else if (search) {
      sortObj = { score: { $meta: 'textScore' } as unknown as 1 };
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.model.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map((d) => this.toDomain(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateProductData): Promise<Product> {
    const doc = await this.model.create(data);
    return this.toDomain(doc);
  }

  async existsBySku(sku: string): Promise<boolean> {
    const count = await this.model.countDocuments({ sku }).exec();
    return count > 0;
  }

  private toDomain(doc: ProductDocument): Product {
    return new Product(
      (doc._id as unknown as { toString(): string }).toString(),
      doc.name,
      doc.sku,
      doc.price,
      doc.imageUrl,
      (doc as unknown as { createdAt: Date }).createdAt,
      (doc as unknown as { updatedAt: Date }).updatedAt,
    );
  }
}
