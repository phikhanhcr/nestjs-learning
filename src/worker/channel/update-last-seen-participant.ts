import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { JOB_UPDATE_LAST_SEEN_PARTICIPANTS } from 'src/config/job.interface';
import { IReadMessage } from 'src/channel/channel.interface';
import { PushLastSeenToParticipantBucket } from 'src/channel/read-message.bucket';
@Injectable()
export class UpdateLastSeenParticipantJob implements OnApplicationBootstrap {
    private static connectionOps = {
        connection: {
            host: 'localhost',
            port: 6379,
        },
        concurrency: 1,
    };
    constructor() {}

    async onApplicationBootstrap() {
        this.listen();
    }

    listen() {
        const worker = new Worker(
            JOB_UPDATE_LAST_SEEN_PARTICIPANTS,
            async (job: Job<IReadMessage>) => {
                this.process(job);
            },
            UpdateLastSeenParticipantJob.connectionOps,
        );
        worker.on('completed', (job) => {
            console.log(`Job completed with result ${job.returnvalue}`);
        });
        worker.on('failed', (job, err) => {
            console.log(`Job failed with reason ${err}`);
        });
    }

    async process(job: Job<IReadMessage>) {
        Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
        const data = job.data as IReadMessage;
        PushLastSeenToParticipantBucket(data);
    }
}
