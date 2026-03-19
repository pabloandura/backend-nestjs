import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { ProductQueryDto } from '../../application/dtos/product-query.dto';
import { ParseMongoIdPipe } from '../../../../common/pipes/parse-mongo-id.pipe';

const ALLOWED_IMAGE_MIMETYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const imageUploadInterceptor = FileInterceptor('image', {
  storage: diskStorage({
    destination: process.env.UPLOADS_DEST ?? './uploads',
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (
      !ALLOWED_IMAGE_MIMETYPES.has(file.mimetype) ||
      !ALLOWED_IMAGE_EXTENSIONS.has(ext)
    ) {
      cb(new Error('Only image files (jpg, png, webp, gif) are allowed'), false);
    } else {
      cb(null, true);
    }
  },
});

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly listProducts: ListProductsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(imageUploadInterceptor)
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.createProduct.execute(dto, file);
  }

  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.listProducts.execute(query);
  }

  @Get(':id')
  getOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.getProduct.execute(id);
  }
}
