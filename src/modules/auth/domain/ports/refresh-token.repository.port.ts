import { RefreshToken } from '../entities/refresh-token.entity';

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface IRefreshTokenRepository {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<RefreshToken>;
  findByTokenHash(hash: string): Promise<RefreshToken | null>;
  deleteByTokenHash(hash: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}
