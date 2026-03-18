import { Injectable, NotImplementedException } from '@nestjs/common';
import { IStoragePort } from '../../domain/ports/storage.port';

/**
 * S3 storage adapter — production adapter for AWS deployments.
 * Swap in by binding STORAGE_PORT to this class in products.module.ts
 * when STORAGE_DRIVER=s3.
 *
 * Implementation left as a stub; wire up @aws-sdk/client-s3 here.
 */
@Injectable()
export class S3StorageAdapter implements IStoragePort {
  async save(_file: Express.Multer.File): Promise<string> {
    // TODO: implement PutObjectCommand with @aws-sdk/client-s3
    throw new NotImplementedException('S3 storage adapter not yet implemented');
  }

  async delete(_urlOrPath: string): Promise<void> {
    // TODO: implement DeleteObjectCommand with @aws-sdk/client-s3
    throw new NotImplementedException('S3 storage adapter not yet implemented');
  }
}
