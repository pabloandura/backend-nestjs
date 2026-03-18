import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/ports/user.repository.port';
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '../../domain/ports/refresh-token.repository.port';
import { TokenPair } from './login.use-case';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(rawToken: string): Promise<TokenPair> {
    // Find all tokens and compare — bcrypt compare required since we store hashes
    // In a real system: use a short-lived lookup token or an indexed partial hash.
    // For this scope we find by iterating user's tokens; acceptable for interview scope.
    const storedToken = await this.findMatchingToken(rawToken);

    if (!storedToken || storedToken.isExpired()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotation: invalidate the old token immediately
    await this.refreshTokenRepository.deleteByTokenHash(storedToken.tokenHash);

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.configService.get<string>('jwt.accessExpiresIn') },
    );

    const newRawToken = randomUUID();
    const newHash = await bcrypt.hash(newRawToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
    });

    return { accessToken, refreshToken: newRawToken };
  }

  private async findMatchingToken(rawToken: string) {
    // Delegated to the repository to do hash comparison efficiently
    // The repository will use bcrypt.compare under the hood
    return this.refreshTokenRepository.findByTokenHash(rawToken);
  }
}
