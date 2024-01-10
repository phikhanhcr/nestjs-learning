import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { USER_PROCESSOR } from 'src/config/job.interface';

@QueueEventsListener(USER_PROCESSOR)
export class WorkerListener extends QueueEventsHost {
    private logger = new Logger(WorkerListener.name);
    @OnQueueEvent('active')
    onQueueEventActive(job: any) {
        this.logger.log(`Job has been started!`);
        this.logger.log(job);
    }

    @OnQueueEvent('completed')
    onQueueEventCompleted(job: Job, result: any) {
        this.logger.log(`Job has been completed!!`);
    }
}
