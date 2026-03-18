import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';

@Injectable()
export class RefreshTokenTypeOrmRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const orm = this.repo.create({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findByTokenHash(rawToken: string): Promise<RefreshToken | null> {
    // Load all tokens for comparison — acceptable at this scale.
    // Production optimisation: store a fast-lookup prefix + bcrypt hash.
    const all = await this.repo.find();
    for (const orm of all) {
      const match = await bcrypt.compare(rawToken, orm.tokenHash);
      if (match) return this.toDomain(orm);
    }
    return null;
  }

  async deleteByTokenHash(rawToken: string): Promise<void> {
    const token = await this.findByTokenHash(rawToken);
    if (token) {
      await this.repo.delete({ tokenHash: token.tokenHash });
    }
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  private toDomain(orm: RefreshTokenOrmEntity): RefreshToken {
    return new RefreshToken(
      orm.id,
      orm.userId,
      orm.tokenHash,
      orm.expiresAt,
      orm.createdAt,
    );
  }
}
