import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/refresh-token.orm-entity';
import { UserTypeOrmRepository } from './infrastructure/persistence/user.typeorm-repository';
import { RefreshTokenTypeOrmRepository } from './infrastructure/persistence/refresh-token.typeorm-repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './infrastructure/http/auth.controller';

import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { REFRESH_TOKEN_REPOSITORY } from './domain/ports/refresh-token.repository.port';

import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Port → Adapter bindings
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenTypeOrmRepository },
    // Infrastructure
    JwtStrategy,
    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
  exports: [
    // Export so other modules can use JwtAuthGuard / RolesGuard
    JwtModule,
    PassportModule,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
})
export class AuthModule {}
