import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStoragePort } from '../../domain/ports/storage.port';
import { join, basename } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class LocalStorageAdapter implements IStoragePort {
  constructor(private readonly configService: ConfigService) {}

  async save(file: Express.Multer.File): Promise<string> {
    // Multer (configured with diskStorage) has already written the file to disk.
    // We just return a URL path the client can use to retrieve it.
    const uploadsPath = this.configService.get<string>('storage.uploadsDest') ?? './uploads';
    const filename = basename(file.path ?? file.originalname);
    return `/uploads/${filename}`;
  }

  async delete(urlOrPath: string): Promise<void> {
    const uploadsBase = this.configService.get<string>('storage.uploadsDest') ?? './uploads';
    const filename = basename(urlOrPath);
    const fullPath = join(uploadsBase, filename);
    try {
      await unlink(fullPath);
    } catch {
      // File may already be gone — not a fatal error
    }
  }
}
