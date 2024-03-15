import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueService } from 'src/infrastructure/queue.service';
@Injectable()
export class UserWorkerBackgroundService implements OnApplicationBootstrap {
    private static connectionOps = {
        connection: {
            host: 'localhost',
            port: 6379,
        },
        concurrency: 1,
    };
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly queueService: QueueService,
    ) {}
    async onApplicationBootstrap() {
        this.listen();
    }

    listen() {
        const worker = new Worker(
            'sendMail',
            async (job) => {
                this.process(job);
            },
            UserWorkerBackgroundService.connectionOps,
        );
        worker.on('completed', (job) => {
            Logger.debug(`Job completed with result ${job.returnvalue}`);
        });
        worker.on('failed', (job, err) => {
            Logger.debug(`Job failed with reason ${err}`);
        });
    }

    process(job) {
        this.eventEmitter.emit('test', '1234');
    }
}
