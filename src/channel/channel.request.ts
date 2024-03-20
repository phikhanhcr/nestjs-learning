import e from 'express';
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
