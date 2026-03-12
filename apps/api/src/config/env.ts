import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().default('3001'),
  API_URL: z.string().default('http://localhost:3001'),
  WEB_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  YOUTUBE_API_KEY: z.string().optional(),
  SOUNDCLOUD_CLIENT_ID: z.string().optional(),

  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  MAX_FILE_SIZE: z.string().default('104857600'),
  ALLOWED_FILE_TYPES: z.string().default('audio/mpeg,audio/mp4,audio/flac,audio/wav,audio/ogg'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  CACHE_TTL_YOUTUBE: z.string().default('1800'),
  CACHE_TTL_SOUNDCLOUD: z.string().default('1800'),
  CACHE_TTL_METADATA: z.string().default('3600'),
});

export const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.API_PORT, 10),
  apiUrl: env.API_URL,
  webUrl: env.WEB_URL,

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  youtube: {
    apiKey: env.YOUTUBE_API_KEY,
  },

  soundcloud: {
    clientId: env.SOUNDCLOUD_CLIENT_ID,
  },

  storage: {
    type: env.STORAGE_TYPE,
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
    },
  },

  upload: {
    maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },

  cache: {
    ttl: {
      youtube: parseInt(env.CACHE_TTL_YOUTUBE, 10),
      soundcloud: parseInt(env.CACHE_TTL_SOUNDCLOUD, 10),
      metadata: parseInt(env.CACHE_TTL_METADATA, 10),
    },
  },
};
