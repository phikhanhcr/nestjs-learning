import { ChannelType } from './entity/channel.entity';

export interface ICreateChannelRequest {
    type: ChannelType;
    members: number[];
}
