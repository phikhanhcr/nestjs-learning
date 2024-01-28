import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
@Injectable()
export class QueueService {
    private queues: Map<string, Queue> = new Map<string, Queue>();

    async getQueue<T = unknown>(jobName: string): Promise<Queue<T>> {
        let queue = this.queues.get(jobName);
        if (!queue) {
            queue = new Queue<T>(jobName, {
                connection: {
                    host: 'localhost',
                    port: 6379,
                },
            });
            queue.on('removed', (job) => {
                Logger.debug(`Job removed with result ${job}`, jobName);
            });
            queue.on('error', (error) => {
                Logger.error('Error process queue', { error, data: { jobName } });
            });
            this.queues.set(jobName, queue);
        }
        return queue;
    }
}
