import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMiddleware } from './user.middleware';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProcessor } from './user.processor';
import { UserCreatedEvent } from './listeners/user-created.listener';
import { PostModule } from '../post/post.module';
import { AuthService } from '../auth/auth.service';

@Module({
    providers: [UserService, UserProcessor, UserCreatedEvent, AuthService],
    controllers: [UserController],
    imports: [
        TypeOrmModule.forFeature([User]),
        BullModule.registerQueue({
            name: 'user',
        }),
        PostModule.register({
            host: 'userModule',
        }),
    ],
    exports: [UserService],
})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserMiddleware).forRoutes('users');
    }
}
