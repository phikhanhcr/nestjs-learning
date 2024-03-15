import { IMember, IChannelMessagesResponse } from 'src/channel/channel.interface';
import { ChannelMessageType } from 'src/channel/entity/channel.entity';

export const USER_PROCESSOR = 'user';
export const CHANNEL_PROCESSOR = 'channel';

export const JOB_PREPROCESS_CHANNEL_MESSAGE = 'preprocess_channel_message';
export const JOB_SAVE_MESSAGE_TO_DB = 'save_message_to_db';
export const JOB_UPDATE_LAST_SEEN_PARTICIPANTS = 'update_last_seen_participants';

export interface IJobPreprocessChannelMessage {
    id: string;
    nonce: string;
    channel_key: string;
    message: string;
    message_type: ChannelMessageType;
    sender: IMember;
    sequence: number;
    sent_at: number;
}

export interface IJobUPdateLastSeenParticipants {}

export interface IJobSaveMessageToDB {
    id: string;
    nonce: string;
    channel_id: number;
    message: string;
    message_type: ChannelMessageType;
    sender: IMember;
    sequence: number;
    sent_at: number;
}
