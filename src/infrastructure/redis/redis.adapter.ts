import ioredis, { Redis } from 'ioredis';
import { QueueOptions } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Singleton Redis client
 */

@Injectable()
export class RedisAdapter {
    private static client: Redis;

    private static subscriber: Redis;
    private static allClients: Redis[] = [];

    static async getClient(): Promise<Redis> {
        if (!RedisAdapter.client) {
            await RedisAdapter.connect();
        }
        return RedisAdapter.client;
    }

    static async connect(overrideClient = true, options = {}): Promise<Redis> {
        const tmp = new ioredis(process.env.REDIS_URI, {
            lazyConnect: true,
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
            ...options,
        });

        tmp.on('ready', () => {
            Logger.log('Connect to redis successfully!');
        });
        tmp.on('end', () => {
            Logger.log('Connect to redis ended!');
        });

        tmp.on('error', (error) => {
            Logger.error('Connect to redis error!', error);
        });

        try {
            await tmp.connect();
        } catch (error) {
            Logger.error('Connect to redis error!', error);
            process.exit(1);
        }

        if (overrideClient) {
            RedisAdapter.client = tmp;
        }
        RedisAdapter.allClients.push(tmp);
        return tmp;
    }

    static createClient(options = {}): Redis {
        const tmp = new ioredis(process.env.REDIS_URI, {
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
            ...options,
        });

        tmp.on('ready', () => {
            Logger.log('Connect to redis successfully!');
        });
        tmp.on('end', () => {
            Logger.log('Connect to redis ended!');
        });

        tmp.on('error', (error) => {
            Logger.error('Connect to redis error!', error);
            process.exit(1);
        });

        RedisAdapter.allClients.push(tmp);

        return tmp;
    }

    static async disconnect(): Promise<void> {
        Logger.log('Closing redis connection...');
        try {
            await Promise.all(RedisAdapter.allClients.map((client) => client.quit()));
        } catch (error) {
            Logger.error('Closing redis connection error!', error);
        }
    }

    static serialize(value: unknown): string {
        if (value) {
            return JSON.stringify(value);
        }
        return value as string;
    }

    static deserialize(value: unknown): unknown {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        }
        return value;
    }

    // static async getOrSet(key: string, callback: () => Promise<string>, ttl: unknown = 0): Promise<string> {
    //     let value = await RedisClient.client.get(key);
    //     if (value === null) {
    //         value = await callback();
    //         let ttlVal: number;
    //         if (typeof ttl === 'function') {
    //             ttlVal = ttl(value);
    //         } else {
    //             ttlVal = ttl as number;
    //         }
    //         if (ttlVal > 0) {
    //             await RedisClient.client.set(key, value, 'EX', ttlVal);
    //         } else {
    //             await RedisClient.client.set(key, value);
    //         }
    //     }
    //     return value;
    // }

    static async get(key: string, shouldDeserialize = false): Promise<unknown> {
        const value = await (await RedisAdapter.getClient()).get(key);
        return shouldDeserialize ? RedisAdapter.deserialize(value) : value;
    }

    static async set(key: string, value: unknown, ttl = 0, shouldSerialize = false): Promise<unknown> {
        const stringValue: string = shouldSerialize ? RedisAdapter.serialize(value) : (value as string);
        if (ttl > 0) {
            return (await RedisAdapter.getClient()).set(key, stringValue, 'EX', ttl);
        }
        return (await RedisAdapter.getClient()).set(key, stringValue);
    }

    static async hset(key: string, field: string, value: string): Promise<unknown> {
        try {
            const data = { [field]: value };
            const result = await (await RedisAdapter.getClient()).hset(key, data);
            Logger.log(`'HSET ${key} ${field} ${value}' to Redis successfully!`);
            return result;
        } catch (error) {
            Logger.error(`'HSET ${key} ${field} ${value}' to Redis error!`, error);
        }
    }

    static async hmset(key: string, data: Map<string, string>): Promise<unknown> {
        try {
            const result = await (await RedisAdapter.getClient()).hmset(key, data);
            Logger.log(`'HMSET ${key} ${data}' to Redis successfully!`);
            return result;
        } catch (error) {
            Logger.error(`'HMSET ${key} ${data}' to Redis error!`, error);
        }
    }

    static async hget(key: string, field: string): Promise<unknown> {
        try {
            const result = await (await RedisAdapter.getClient()).hget(key, field);
            Logger.log(`'HGET ${key} ${field}' from Redis successfully!`);
            return result;
        } catch (error) {
            Logger.error(`'HGET ${key} ${field}' from Redis error!`, error);
        }
    }

    static async hmget(key: string, fields: string[]): Promise<unknown> {
        try {
            const result = await (await RedisAdapter.getClient()).hmget(key, fields);
            const data = {};
            for (let i = 0; i < fields.length; i++) {
                data[fields[i]] = result[i];
            }
            Logger.log(`'HMGET ${key}' from Redis successfully!`);
            return data;
        } catch (error) {
            Logger.error(`'HMGET ${key}' from Redis error!`, error);
        }
    }

    static async delete(key: string): Promise<unknown> {
        return (await RedisAdapter.getClient()).del(key);
    }

    static async mget(keys: string[], shouldDeserialize = false): Promise<unknown[]> {
        const values = await (await RedisAdapter.getClient()).mget(keys);
        return shouldDeserialize ? values.map(RedisAdapter.deserialize) : values;
    }

    static async rpush(key: string, value: unknown, shouldSerialize = false): Promise<unknown> {
        const stringValue: string = shouldSerialize ? RedisAdapter.serialize(value) : (value as string);
        return (await RedisAdapter.getClient()).rpush(key, stringValue);
    }

    static async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return (await RedisAdapter.getClient()).lrange(key, start, stop);
    }

    static async keys(key: string): Promise<string[]> {
        return (await RedisAdapter.getClient()).keys(key);
    }

    static async lpop(key: string): Promise<string> {
        return (await RedisAdapter.getClient()).lpop(key);
    }

    static async exists(key: string): Promise<number> {
        return (await RedisAdapter.getClient()).exists(key);
    }

    static async incr(key: string): Promise<number> {
        return (await RedisAdapter.getClient()).incr(key);
    }

    static async hincr(key: string, field: string): Promise<number> {
        return (await RedisAdapter.getClient()).hincrby(key, field, 1);
    }

    static async expire(key: string, ttl: number): Promise<number> {
        return (await RedisAdapter.getClient()).expire(key, ttl);
    }
}
