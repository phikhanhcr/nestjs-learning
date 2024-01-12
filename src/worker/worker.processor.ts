// import { Logger } from '@nestjs/common';
// import {  Job } from 'bullmq';

// export default function (job: Job<{ id: string }>, cb: DoneCallback) {
//     console.log('zo day');
//     Logger.debug(`${job.data.id} (pid ${process.pid})`, `SEPARATE`);
//     cb(null, 'Hurrah');
// }

import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { USER_PROCESSOR } from 'src/config/job.interface';

@Injectable()
@Processor(USER_PROCESSOR)
export class WorkerProcessorHost extends WorkerHost {
    private logger = new Logger();
    constructor(@InjectQueue(USER_PROCESSOR) private readonly userQueue: Queue) {
        super();
    }

    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        console.log({ name: 'job.name' });
    }
}
