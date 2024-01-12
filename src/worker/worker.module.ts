import { WorkerService } from './worker.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { USER_PROCESSOR } from 'src/config/job.interface';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEvent } from 'src/user/listeners/user-created.listener';
import { WorkerProcessorHost } from './worker.processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: USER_PROCESSOR,
            processors: [
                {
                    concurrency: 1,
                    path: join(__dirname, '../user/user.sandbox.processor.js'),
                },
            ],
            prefix: 'ins-chat',
            connection: {
                host: 'localhost',
                port: 6379,
            },
        }),
        EventEmitterModule.forRoot(),
    ],

    providers: [UserEvent],
})
export class WorkerModule {}
