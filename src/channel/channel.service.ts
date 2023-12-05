import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Channel, ChannelMessageType, ChannelType, IChannelInformationResponse } from './entities/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateChannelRequest } from './channel.request';
import { IAuthUser } from 'src/auth/auth.interface';
import { ParticipantService } from 'src/participant/participant.service';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelsRepository: Repository<Channel>,
        @Inject(forwardRef(() => ParticipantService)) private readonly participantService: ParticipantService,
    ) {}

    async create(auth: IAuthUser, req: ICreateChannelRequest): Promise<IChannelInformationResponse> {
        console.log({ auth, req });
        let channelId: string;
        let channelName: string;
        let channelAvatar: string;

        const usersInfo = [{ id: auth.id }, { id: req.members[0] }];
        switch (req.type) {
            case ChannelType.DIRECT:
                channelId = await this.participantService.getChannelId(usersInfo);
                break;
        }

        console.log({ channelId });

        // const getParticipantInfo = this.participantService.getParticipantInfo(channelId, auth.id);

        // console.log({ getParticipantInfo });

        return { id: channelId, name: channelName, avatar: channelAvatar };
    }

    async findChannelByDirectKey(u1: number, u2: number): Promise<Channel> {
        return this.channelsRepository.findOneBy({ keyChannel: { u1, u2 } });
    }
}
