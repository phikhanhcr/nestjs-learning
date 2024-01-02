import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmService } from './infrastructure/database/typeorm.service';
import { DataSource } from 'typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { ParticipantModule } from './participant/participant.module';
import { MessageModule } from './message/message.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { ChannelModule } from './channel/channel.module';
import { CacheModule } from '@nestjs/cache-manager';
import UserProcessorModule from './user/user.processor';
import { USER_PROCESSOR } from './config/job.interface';
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
        // ChannelModule,
        // ParticipantModule,
        MessageModule,
        CacheModule.register({
            isGlobal: true,
        }),
    ],
    providers: [],
})
export class AppModule {}
