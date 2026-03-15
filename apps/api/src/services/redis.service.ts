import { createClient } from 'redis';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class RedisService {
  private static instance: RedisService;
  private client: ReturnType<typeof createClient>;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: config.redis.url,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis Client Ready');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      logger.info('Redis Client Disconnected');
      this.isConnected = false;
    });

    // Connect to Redis
    this.connect();
  }

  private async connect() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache read');
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis GET error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping cache write');
      return;
    }

    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      logger.error('Redis SET error', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error });
      return false;
    }
  }

  async flushAll(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.flushAll();
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error('Redis FLUSHALL error', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected gracefully');
    } catch (error) {
      logger.error('Error disconnecting Redis client', error);
    }
  }
}

export const redisService = RedisService.getInstance();
