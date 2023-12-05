import { Module, forwardRef } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ChannelService } from 'src/channel/channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'diagnostics_channel';
import { Participant } from './entity/participant.entity';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
    providers: [ParticipantService],
    imports: [
        TypeOrmModule.forFeature([Participant]),
        TypeOrmModule.forFeature([Channel]),
        forwardRef(() => ChannelModule),
    ],
    exports: [ParticipantService],
})
export class ParticipantModule {}
