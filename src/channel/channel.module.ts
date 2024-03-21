import { Module, forwardRef } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entity/channel.entity';
import { AuthService } from 'src/auth/auth.service';
import { ParticipantService } from 'src/participant/participant.service';
import { ParticipantModule } from 'src/participant/participant.module';
import { Participant } from 'src/participant/entity/participant.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { QueueService } from 'src/infrastructure/queue.service';
import { Message } from 'src/message/entity/message.entity';

@Module({
    controllers: [ChannelController],
    providers: [ChannelService, ParticipantService, AuthService, UserService, QueueService],
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Channel, User, Participant, Message]),
        // TypeOrmModule.forFeature([User]),
        // TypeOrmModule.forFeature([Participant]),
        forwardRef(() => ParticipantModule),
    ],
    exports: [ChannelService],
})
export class ChannelModule {}
