import { Module } from '@nestjs/common';
import { QueueService } from '../../infrastructure/queue.service';
import { ProcessChannelMessageJob } from './process-channel-message';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/channel/channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Participant } from 'src/participant/entity/participant.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ParticipantService } from 'src/participant/participant.service';
import { SaveMessageToDBJob } from './save-message-to-db';
import { Message } from 'src/message/entity/message.entity';
import { MessageService } from 'src/message/message.service';
import { Channel } from 'src/channel/entity/channel.entity';

@Module({
    providers: [
        ProcessChannelMessageJob,
        SaveMessageToDBJob,
        QueueService,
        UserService,
        ChannelService,
        ConfigService,
        ParticipantService,
        MessageService,
    ],
    imports: [
        TypeOrmModule.forFeature([Channel]),
        TypeOrmModule.forFeature([Message]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Participant]),
        HttpModule,
    ],
})
export class ChannelBackgroundModule {}
