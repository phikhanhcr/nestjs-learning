import { BullModule } from '@nestjs/bull';
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
import UserProcessorModule from './user.processor';

@Module({
    providers: [UserService, UserCreatedEvent, AuthService],
    controllers: [UserController],
    imports: [
        TypeOrmModule.forFeature([User]),
        HttpModule,
        BullModule.registerQueue({
            name: USER_PROCESSOR,
            processors: [UserProcessorModule],
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
