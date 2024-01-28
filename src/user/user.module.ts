import { WorkerService } from './../worker/worker.service';
import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMiddleware } from './user.middleware';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserProcessor } from './user.processor';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { USER_PROCESSOR } from 'src/config/job.interface';
import { join } from 'path';
import { UserProcessor } from './user.processor';
import { UserEvent } from './listeners/user-created.listener';
import { EventsService } from 'src/common/eventbus/eventbus.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueService } from 'src/infrastructure/queue.service';
// import UserProcessorModule from './user.processor';
// import OtherProcessorModule from './other.processor';

@Module({
    providers: [UserService, AuthService, UserEvent, QueueService],
    controllers: [UserController],
    imports: [
        TypeOrmModule.forFeature([User]),
        HttpModule,

        // EventEmitterModule.forRoot(),
    ],
    exports: [UserService],
})
export class UserModule {}

// implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer.apply(UserMiddleware).forRoutes('users');
//     }
// }
