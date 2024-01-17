import { WorkerService } from './worker.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { USER_PROCESSOR } from 'src/config/job.interface';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WorkerProcessorHost } from './worker.processor';
import { EventsService } from 'src/common/eventbus/eventbus.service';
import { UserEvent } from 'src/user/listeners/user-created.listener';
import { SomeOtherService } from 'src/user/test.service';
import { UserBackgroundModule } from './user/backgroud.module';

@Module({
    imports: [
        // BullModule.registerQueue({
        //     name: USER_PROCESSOR,
        //     processors: [
        //         {
        //             concurrency: 1,
        //             path: join(__dirname, '../user/user.sandbox.processor.js'),
        //         },
        //     ],
        //     prefix: 'ins-chat',
        //     connection: {
        //         host: 'localhost',
        //         port: 6379,
        //     },
        // }),
        UserBackgroundModule,
        EventEmitterModule.forRoot(),
    ],

    providers: [],
})
export class WorkerModule {}
