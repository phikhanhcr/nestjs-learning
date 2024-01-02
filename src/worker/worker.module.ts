import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { USER_PROCESSOR } from 'src/config/job.interface';

import UserProcessorModule from '../user/user.processor';

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
            prefix: 'ins-chat',
        }),
        BullModule.registerQueue({
            name: USER_PROCESSOR,
            processors: [UserProcessorModule],
        }),
    ],
    providers: [],
})
export class WorkerModule {}
