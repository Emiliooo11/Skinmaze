import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client: Redis

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.config.get('REDIS_URL') || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    this.client.on('error', (err) => this.logger.error('Redis error', err))
    this.client.on('connect', () => this.logger.log('Redis connected'))
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  getClient(): Redis {
    return this.client
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    const lockKey = `lock:${key}`
    const result = await this.client.set(lockKey, '1', 'PX', ttlMs, 'NX')
    return result === 'OK'
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(`lock:${key}`)
  }
}
