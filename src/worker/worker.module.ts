import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserBackgroundModule } from './user/backgroud.module';
import { ChannelBackgroundModule } from './channel/channel.module';
import { TypeOrmService } from 'src/infrastructure/database/typeorm.service';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import appConfig from 'src/config/app.config';
import databaseConfig from 'src/config/database.config';
import { Channel } from 'diagnostics_channel';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [appConfig, databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeOrmService,
            imports: [ConfigModule],
            // inject: [ConfigService],
            dataSourceFactory: async (options) => {
                const dataSource = await new DataSource(options).initialize();
                console.log({ dataSource });
                return dataSource;
            },
        }),
        UserBackgroundModule,
        ChannelBackgroundModule,
        EventEmitterModule.forRoot(),
    ],

    providers: [],
})
export class WorkerModule {}
