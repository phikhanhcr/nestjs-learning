import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { BullModule } from '@nestjs/bull';
import { AuthMiddleware } from '../auth/auth.middleware';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({})
export class PostModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('posts');
    }
    // dynamic module
    static register(options: any): DynamicModule {
        return {
            module: PostModule,
            controllers: [PostController],
            providers: [
                PostService,
                {
                    provide: 'OPTIONS',
                    useValue: options,
                },
                {
                    provide: 'POST_OPTIONS',
                    useClass: UserService,
                },
                AuthService,
            ],
            exports: [PostService],
            imports: [
                TypeOrmModule.forFeature([User]),
                BullModule.registerQueue({
                    name: 'user',
                }),
                UserModule,
                AuthModule,
            ],
        };
    }
}
