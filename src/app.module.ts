import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmService } from './infrastructure/database/typeorm.service';
import { DataSource } from 'typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PostModule } from './post/post.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ChannelController } from './channel/channel.controller';
import { ParticipantController } from './participant/participant.controller';
import { ParticipantModule } from './participant/participant.module';
import { MessageController } from './message/message.controller';
import { MessageModule } from './message/message.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { ChannelModule } from './channel/channel.module';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [appConfig, databaseConfig],
        }),
        UserModule,
        // PostModule,
        TypeOrmModule.forRootAsync({
            useClass: TypeOrmService,
            imports: [ConfigModule],
            // inject: [ConfigService],
            dataSourceFactory: async (options) => {
                const dataSource = await new DataSource(options).initialize();
                return dataSource;
            },
        }),
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
            prefix: 'ins-chat',
        }),
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '-',
            verboseMemoryLeak: true,
            ignoreErrors: false,
        }),
        AuthModule,
        ChannelModule,
        ParticipantModule,
        MessageModule,
        CacheModule.register({
            isGlobal: true,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
