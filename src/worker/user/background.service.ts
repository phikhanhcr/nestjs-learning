import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class UserWorkerBackgroundService implements OnApplicationBootstrap {
    constructor(private readonly eventEmitter: EventEmitter2) {}
    onApplicationBootstrap() {
        this.eventEmitter.emit('test', '1234');
        this.createSendGreetingsWorker();
    }

    createSendGreetingsWorker() {
        const worker = new Worker(
            'sendMail',
            async (job) => {
                console.log('Send email to ' + job.data.user.name);
            },
            {
                connection: {
                    host: 'localhost',
                    port: 6379,
                },
                concurrency: 1,
            },
        );
        worker.on('completed', (job) => {
            console.log(`Job completed with result ${job.returnvalue}`);
            this.eventEmitter.emit('test', '1234');
        });
        worker.on('failed', (job, err) => {
            console.log(`Job failed with reason ${err}`);
        });
    }
}
