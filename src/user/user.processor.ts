import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('user')
export class UserProcessor {
    private readonly logger = new Logger(UserProcessor.name);

    @Process('transcode')
    handleTranscode(job: Job) {
        console.log('Start transcoding...');
        this.logger.debug(job.data);
        this.logger.debug('Transcoding completed');
    }
}
