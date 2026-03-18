import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { RolesGuard } from './modules/auth/infrastructure/guards/roles.guard';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

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
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
