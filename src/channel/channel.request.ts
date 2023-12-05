import { ChannelType } from './entities/channel.entity';

export interface ICreateChannelRequest {
    type: ChannelType;
    members: number[];
}
