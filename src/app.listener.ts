import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { USER_PROCESSOR } from './config/job.interface';

@QueueEventsListener(USER_PROCESSOR)
export class AppListener extends QueueEventsHost {
    private logger = new Logger(AppListener.name);
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
