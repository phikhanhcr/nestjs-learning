import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import {
    Channel,
    ChannelMessageType,
    ChannelType,
    IChannelInformationResponse,
    ILastMessage,
} from './entities/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateChannelRequest } from './channel.request';
import { IAuthUser } from 'src/auth/auth.interface';
import { ParticipantService } from 'src/participant/participant.service';
import { ObjectId } from 'bson';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { APIError } from 'src/common/error/api.error';
import { ErrorCode } from 'src/config/errors';
import httpStatus from 'http-status';
import { IChannelMessagesResponse, ICreateChannelMessageRequest } from './channel.interface';
import {
    CHANNEL_PROCESSOR,
    IJobPreprocessChannelMessage,
    JOB_PREPROCESS_CHANNEL_MESSAGE,
} from 'src/config/job.interface';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { UserService } from 'src/user/user.service';

export const MESSAGE_NONCE_TTL = 7200; // 2H
@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelsRepository: Repository<Channel>,
        private userService: UserService,
        @Inject(forwardRef(() => ParticipantService)) private readonly participantService: ParticipantService,
        @InjectQueue(CHANNEL_PROCESSOR) private readonly channelQueue: Queue,
    ) {}

    async create(auth: IAuthUser, req: ICreateChannelRequest): Promise<IChannelInformationResponse> {
        let channelId: string;
        let channelName: string;
        let channelAvatar: string;

        const usersInfo = [{ id: auth.id }, { id: req.members[0] }];
        switch (req.type) {
            case ChannelType.DIRECT:
                channelId = await this.participantService.getChannelId(usersInfo);
                break;
        }

        return { id: channelId, name: channelName, avatar: channelAvatar };
    }

    // base on user
    async findChannelByDirectKey(u1: number, u2: number): Promise<Channel> {
        return this.channelsRepository.findOneBy({ keyChannel: { u1, u2 } });
    }

    // base on key gen by sys
    async findChannelByKey(id: string): Promise<Channel> {
        return this.channelsRepository.findOneBy({ key: new ObjectId(id) });
    }

    async getSequenceForChannel(channelId: string): Promise<number> {
        try {
            const sequence = await RedisAdapter.hincr(`channel:${channelId}`, 'sequence');
            return sequence;
        } catch (err) {
            throw err;
        }
    }

    async sendMessageToChannel(data: ICreateChannelMessageRequest): Promise<IChannelMessagesResponse> {
        // do something
        // check participant in channel
        const keyCheckUserInChannel = `p:${data.sender.id}`;
        const channelKey = `channel:${data.channel_id}`;
        const channelDataInRedis = await RedisAdapter.hget(channelKey, keyCheckUserInChannel);

        if (channelDataInRedis === null) {
            const participants = JSON.parse((await RedisAdapter.hget(channelKey, 'participants')) as string);
            if (participants !== null && participants.filter((e) => e.id === data.sender.id).length > 0) {
                data;
                await RedisAdapter.hset(channelKey, keyCheckUserInChannel, '1');
            } else {
                throw new APIError({
                    message: `chat.channel.send_message.${ErrorCode.USER_NOT_IN_CHANNEL}`,
                    status: httpStatus.NOT_ACCEPTABLE,
                    errorCode: ErrorCode.USER_NOT_IN_CHANNEL,
                });
            }
        }

        const preprocessChannelMessageDataJob: IJobPreprocessChannelMessage = {
            id: data.id,
            nonce: data.nonce,
            channel_id: data.channel_id,
            message: data.message,
            message_type: data.message_type,
            sender: data.sender,
            sequence: await this.getSequenceForChannel(data.channel_id),
            sent_at: data.sent_at,
        };

        this.channelQueue.add(JOB_PREPROCESS_CHANNEL_MESSAGE, preprocessChannelMessageDataJob);

        return preprocessChannelMessageDataJob as IChannelMessagesResponse;
    }

    async findOrCreateChannel(channelId: string, channelMessage: IChannelMessagesResponse): Promise<void> {
        try {
            const data = await RedisAdapter.hmget(`channel:${channelId}`, ['temporary', 'direct_key', 'participants']);
            const temporary = data[`temporary`];
            if (temporary === '1') {
                const directKey = data[`direct_key`];

                const channelMembers = JSON.parse(data[`participants`]);

                const participants = [];

                if (channelMembers !== null) {
                    await Promise.all(
                        channelMembers.map(async (element) => {
                            const presentationInformation = await this.userService.getUserInformation(element.id);
                            if (presentationInformation) {
                                element.name = presentationInformation.name;
                                element.avatar = presentationInformation.avatar;
                            }
                            participants.push(element);
                        }),
                    );
                }

                const channel: any = {
                    _id: channelId,
                    type: ChannelType.DIRECT,
                    direct_key: JSON.parse(directKey.toString()),
                    last_sequence: channelMessage.sequence,
                    last_message: channelMessage as unknown as ILastMessage,
                    participants: Object.values(participants),
                };

                console.log({ channel });
                // race condition ???
                // channelId = await this.createNewChannel(channel as Channel);

                // const user1 = participants[0];
                // const user2 = participants[1];

                // const iParticipants = [];

                // const lastActivityAt = new Date();

                // const channelKey = JSON.parse(directKey.toString());

                // const participantUser1 = {
                //     user_id: user1.id,
                //     user_type: user1.type,
                //     channel_id: channelId,
                //     channel_key: channelKey,
                //     channel_type: ChannelType.DIRECT,
                //     channel_name: user2.name ? user2.name : 'user',
                //     channel_avatar: user2.avatar,
                //     last_seen: 0,
                //     last_activity_at: lastActivityAt,
                //     last_sequence: channelMessage.sequence,
                //     unread_count: channelMessage.sequence,
                //     last_message: channelMessage as unknown as ILastMessage,
                //     other_last_seen: 0,
                // } as IParticipant;
                // iParticipants.push(participantUser1);

                // const participantUser2 = {
                //     user_id: user2.id,
                //     user_type: user2.type,
                //     channel_id: channelId,
                //     channel_key: channelKey,
                //     channel_type: ChannelType.DIRECT,
                //     channel_name: user1.name ? user1.name : 'user',
                //     channel_avatar: user1.avatar,
                //     last_seen: 0,
                //     last_activity_at: lastActivityAt,
                //     last_sequence: channelMessage.sequence,
                //     unread_count: channelMessage.sequence,
                //     last_message: channelMessage as unknown as ILastMessage,
                //     other_last_seen: 0,
                // } as IParticipant;
                // iParticipants.push(participantUser2);

                // await ParticipantService.createParticipants(iParticipants);

                // await RedisAdapter.hset(`channel:${channelId}`, 'temporary', '0');
            }
        } catch (err) {
            Logger.error(`Create channel error: `, err);
        }
    }
}
