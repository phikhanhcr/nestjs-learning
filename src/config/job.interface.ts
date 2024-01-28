import { IMember } from 'src/channel/channel.interface';
import { ChannelMessageType } from 'src/channel/entity/channel.entity';

export const USER_PROCESSOR = 'user';
export const CHANNEL_PROCESSOR = 'channel';

export const JOB_PREPROCESS_CHANNEL_MESSAGE = 'preprocess_channel_message';
export const JOB_SAVE_MESSAGE_TO_DB = 'save_message_to_db';

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
