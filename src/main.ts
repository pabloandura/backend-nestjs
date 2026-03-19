import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { RolesGuard } from './modules/auth/infrastructure/guards/roles.guard';
import { join } from 'path';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security headers
  app.use(helmet());

  // Limit JSON body size to 1 MB
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Global validation pipe — whitelist strips unknown props, transform coerces types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter — maps domain errors to consistent HTTP responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response envelope — wraps all responses in { success, data, meta }
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  // Global rate-limiting guard
  app.useGlobalGuards(app.get(ThrottlerGuard));

  // Global roles guard — evaluates @Roles() decorator after JwtAuthGuard attaches user
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  const uploadsDir = process.env.UPLOADS_DEST ?? join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:8080',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  app.get(Logger).log(`API running on http://localhost:${port}`);
}

bootstrap();
