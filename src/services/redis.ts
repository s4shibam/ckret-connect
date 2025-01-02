import Redis from 'ioredis'
import { env } from '../constants/env'
import { log } from './log'

let redis: Redis | null = null

export const initRedis = () => {
  if (!env.enable_caching) {
    return null
  }

  if (redis) {
    return redis
  }

  redis = new Redis(env.redis_url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    }
  })

  redis.on('error', (err) => {
    console.error('Redis connection error...\n'.red, err)
  })

  redis.on('connect', () => {
    console.log(`Redis connected`.green)
  })

  return redis
}

export const getRedis = () => {
  if (!redis) {
    throw new Error('Redis connection not initialized')
  }

  return redis
}

type TCacheOptions = {
  ttl?: number // in seconds
  prefix?: string
}

type TWithCacheParams<T> = {
  key: string
  fn: () => Promise<T>
  options?: TCacheOptions
}

export const withCache = async <T>({
  key,
  fn,
  options = {}
}: TWithCacheParams<T>): Promise<T> => {
  if (!env.enable_caching || !redis) {
    return fn()
  }

  const finalKey = options.prefix ? `${options.prefix}:${key}` : key

  try {
    const cachedData = await redis.get(finalKey)

    if (cachedData) {
      return JSON.parse(cachedData) as T
    }
  } catch (error) {
    log.error('Failed to get cached data', { key: finalKey, error })
  }

  const data = await fn()

  if (data) {
    try {
      await redis.set(finalKey, JSON.stringify(data), 'EX', options.ttl || 3600)
    } catch (error) {
      log.error('Failed to cache data', { key: finalKey, error })
    }
  }

  return data
}

export const invalidateCache = async (pattern: string): Promise<void> => {
  if (!env.enable_caching || !redis) {
    return
  }

  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    try {
      await redis.del(...keys)
    } catch (error) {
      log.error('Failed to invalidate cache', { pattern, error })
    }
  }
}

export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    try {
      await redis.quit()
      redis = null
      console.log('Redis connection closed'.yellow)
    } catch (error) {
      console.log(`Redis connection close error...\n`.red, error)
    }
  }
}
