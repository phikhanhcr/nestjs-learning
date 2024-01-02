import { ChannelMessageType } from './entities/channel.entity';

export interface IMember {
    id: number;
    name: string;
    avatar: string;
}

export interface ICreateChannelMessageRequest {
    id: string;
    nonce: string;
    sender: IMember;
    channel_id: string;
    message_type: ChannelMessageType;
    message?: string;
    sent_at: number;
}

export interface IChannelMessagesResponse {
    id: string;
    nonce: string;
    channel_id: string;
    message: string;
    message_type: ChannelMessageType;
    sender: IMember;
    sequence: number;
    sent_at: number;
}
