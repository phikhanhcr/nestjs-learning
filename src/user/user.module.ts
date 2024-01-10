import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMiddleware } from './user.middleware';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserProcessor } from './user.processor';
import { UserCreatedEvent } from './listeners/user-created.listener';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { USER_PROCESSOR } from 'src/config/job.interface';
import { join } from 'path';
import { ImageOptimizationProcessor } from './user.processor';
// import UserProcessorModule from './user.processor';
// import OtherProcessorModule from './other.processor';

@Module({
    providers: [UserService, UserCreatedEvent, AuthService, ImageOptimizationProcessor],
    controllers: [UserController],
    imports: [
        TypeOrmModule.forFeature([User]),
        HttpModule,
        // BullModule.registerQueue({
        //     name: USER_PROCESSOR,
        //     processors: [UserProcessorModule],
        // }),
        // BullModule.registerQueue({
        //     name: 'otherQueue',
        //     processors: [OtherProcessorModule],
        // }),
        // BullModule.registerQueue({
        //     name: USER_PROCESSOR,
        //     processors: [],
        //     prefix: 'ins-chat',
        //     connection: {
        //         host: 'localhost',
        //         port: 6379,
        //     },
        // }),

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
    ],
    exports: [UserService],
})
export class UserModule {}

// implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer.apply(UserMiddleware).forRoutes('users');
//     }
// }
