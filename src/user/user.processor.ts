// import { Logger } from '@nestjs/common';
// import {  Job } from 'bullmq';

// export default function (job: Job<{ id: string }>, cb: DoneCallback) {
//     console.log('zo day');
//     Logger.debug(`${job.data.id} (pid ${process.pid})`, `SEPARATE`);
//     cb(null, 'Hurrah');
// }

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { USER_PROCESSOR } from 'src/config/job.interface';

@Processor(USER_PROCESSOR)
export class ImageOptimizationProcessor extends WorkerHost {
    private logger = new Logger();

    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        console.log({ name: job.name });
    }
}
