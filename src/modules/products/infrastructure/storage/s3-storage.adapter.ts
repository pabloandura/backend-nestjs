import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { IStoragePort } from '../../domain/ports/storage.port';

@Injectable()
export class S3StorageAdapter implements IStoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('storage.aws.region')!;
    this.bucket = this.configService.get<string>('storage.aws.bucket')!;
    this.client = new S3Client({ region: this.region });
  }

  async save(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const key = `uploads/${uuidv4()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async delete(urlOrPath: string): Promise<void> {
    // Extract key from full S3 URL or bare path
    let key: string;
    if (urlOrPath.startsWith('https://')) {
      const url = new URL(urlOrPath);
      key = url.pathname.slice(1); // strip leading /
    } else {
      key = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath;
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
