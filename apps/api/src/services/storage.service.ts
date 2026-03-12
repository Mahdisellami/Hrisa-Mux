import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/env';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

export class StorageService {
  private s3Client?: S3Client;
  private localUploadDir: string;

  constructor() {
    this.localUploadDir = path.join(process.cwd(), 'uploads');

    if (config.storage.type === 's3') {
      this.s3Client = new S3Client({
        region: config.storage.aws.region || 'us-east-1',
        credentials: {
          accessKeyId: config.storage.aws.accessKeyId || '',
          secretAccessKey: config.storage.aws.secretAccessKey || '',
        },
      });
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    if (config.storage.type === 's3') {
      return this.uploadToS3(file, userId);
    } else {
      return this.uploadToLocal(file, userId);
    }
  }

  private async uploadToS3(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    if (!this.s3Client || !config.storage.aws.bucket) {
      throw new Error('S3 not configured');
    }

    const key = `music/${userId}/${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: config.storage.aws.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedBy: userId,
      },
    });

    await this.s3Client.send(command);

    // Generate signed URL valid for 7 days
    const getCommand = new GetObjectCommand({
      Bucket: config.storage.aws.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 604800 });

    return {
      key,
      url,
      size: file.size,
    };
  }

  private async uploadToLocal(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    // Create directory structure: uploads/userId/year/month/
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const userDir = path.join(this.localUploadDir, userId, year, month);
    await fs.mkdir(userDir, { recursive: true });

    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = path.join(userDir, filename);

    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    // Generate key (relative path from uploads dir)
    const key = path.relative(this.localUploadDir, filepath);

    // Generate URL for streaming
    const url = `/api/upload/stream/${encodeURIComponent(key)}`;

    return {
      key,
      url: `${config.apiUrl}${url}`,
      size: file.size,
    };
  }

  async deleteFile(key: string): Promise<void> {
    if (config.storage.type === 's3') {
      await this.deleteFromS3(key);
    } else {
      await this.deleteFromLocal(key);
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !config.storage.aws.bucket) {
      throw new Error('S3 not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: config.storage.aws.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filepath = path.join(this.localUploadDir, key);
    await fs.unlink(filepath);
  }

  async getFileStream(key: string): Promise<Buffer | NodeJS.ReadableStream> {
    if (config.storage.type === 's3') {
      return this.getS3Stream(key);
    } else {
      return this.getLocalStream(key);
    }
  }

  private async getS3Stream(key: string): Promise<NodeJS.ReadableStream> {
    if (!this.s3Client || !config.storage.aws.bucket) {
      throw new Error('S3 not configured');
    }

    const command = new GetObjectCommand({
      Bucket: config.storage.aws.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    if (!response.Body) {
      throw new Error('File not found');
    }

    return response.Body as NodeJS.ReadableStream;
  }

  private async getLocalStream(key: string): Promise<Buffer> {
    const filepath = path.join(this.localUploadDir, key);
    return fs.readFile(filepath);
  }

  getLocalFilePath(key: string): string {
    return path.join(this.localUploadDir, key);
  }
}

export const storageService = new StorageService();
