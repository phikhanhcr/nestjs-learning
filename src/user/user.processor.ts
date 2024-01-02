import { Logger } from '@nestjs/common';
import { DoneCallback, Job } from 'bull';

export default function (job: Job<{ id: string }>, cb: DoneCallback) {
    console.log('zo day');
    console.log({ job });
    Logger.debug(`${job.data.id} (pid ${process.pid})`, `SEPARATE`);
    cb(null, 'Hurrah');
}
