import { Module, forwardRef } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { AuthService } from 'src/auth/auth.service';
import { ParticipantService } from 'src/participant/participant.service';
import { ParticipantModule } from 'src/participant/participant.module';
import { Participant } from 'src/participant/entity/participant.entity';
import { AddSenderInformationMiddleware } from './channel.middleware';
import { ChannelProcessor } from './channel.processor';
import { UserService } from 'src/user/user.service';
import { BullModule } from '@nestjs/bull';
import { CHANNEL_PROCESSOR, USER_PROCESSOR } from 'src/config/job.interface';
import { User } from 'src/user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
    controllers: [ChannelController],
    providers: [ChannelService, ParticipantService, AuthService, ChannelProcessor, UserService],
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Channel]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Participant]),
        forwardRef(() => ParticipantModule),
        BullModule.registerQueue({
            name: CHANNEL_PROCESSOR,
        }),
        BullModule.registerQueue({
            name: USER_PROCESSOR,
        }),
    ],
    exports: [ChannelService],
})
export class ChannelModule {}
