import { IMember } from 'src/channel/channel.interface';
import { ChannelMessageType } from 'src/channel/entities/channel.entity';

export const USER_PROCESSOR = 'user';
export const CHANNEL_PROCESSOR = 'channel';

export const JOB_PREPROCESS_CHANNEL_MESSAGE = 'preprocess_channel_message';

export interface IJobPreprocessChannelMessage {
    id: string;
    nonce: string;
    channel_id: string;
    message: string;
    message_type: ChannelMessageType;
    sender: IMember;
    sequence: number;
    sent_at: number;
}
