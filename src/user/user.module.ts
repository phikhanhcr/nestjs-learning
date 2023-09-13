import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMiddleware } from './user.middleware';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    providers: [UserService],
    controllers: [UserController],
    imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(UserMiddleware).forRoutes('users');
    }
}
