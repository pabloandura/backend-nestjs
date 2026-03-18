import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserData,
  IUserRepository,
} from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserRole } from '../../../../common/decorators/roles.decorator';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOneBy({ email });
    return orm ? this.toDomain(orm) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const orm = this.repo.create({
      name: data.name,
      email: data.email,
      password: data.passwordHash,
      role: UserRole.USER,
    });
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: UserOrmEntity): User {
    return new User(
      orm.id,
      orm.name,
      orm.email,
      orm.password,
      orm.role,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
