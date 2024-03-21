import { ChannelType } from './entity/channel.entity';

export interface IListChannelsRequest {
    limit: number;
    after?: number;
    before?: number;
}
export interface ICreateChannelRequest {
    type: ChannelType;
    members: number[];
}

export interface IGetMessageFromChannelRequest {
    channel_id: number;
    limit: number;
    before: number;
    after: number;
}
