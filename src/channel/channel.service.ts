import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import {
    Channel,
    ChannelMessageType,
    ChannelType,
    IChannelInformationResponse,
    ILastMessage,
} from './entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateChannelRequest, IListChannelsRequest } from './channel.request';
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
    IJobSaveMessageToDB,
    JOB_PREPROCESS_CHANNEL_MESSAGE,
} from 'src/config/job.interface';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UserService } from 'src/user/user.service';
import { QueueService } from 'src/infrastructure/queue.service';
import { Participant } from 'src/participant/entity/participant.entity';
import { ISaveMessage } from 'src/message/entity/message.entity';
import { IListResponse, IPaginationMeta } from 'src/common/response.interface';
import { stringify } from 'querystring';
import * as moment from 'moment-timezone';

export const MESSAGE_NONCE_TTL = 7200; // 2H
@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelsRepository: Repository<Channel>,
        @InjectRepository(Participant)
        private participantRepository: Repository<Participant>,
        private userService: UserService,
        @Inject(forwardRef(() => ParticipantService)) private readonly participantService: ParticipantService,
        private readonly queueService: QueueService,
    ) {}

    async listChannels(auth: IAuthUser, req: IListChannelsRequest): Promise<IListResponse<Participant>> {
        const meta: IPaginationMeta = {
            next: '',
            prev: '',
        };
        // Your logic here
        const conditions = {
            userId: auth.id,
        } as any;

        const query = this.participantRepository.createQueryBuilder().where(conditions);
        query.orderBy({ last_active_at: 'DESC' });

        if (req.after) {
            query.andWhere('last_active_at > :after', { after: moment(+req.after).toDate() });
            query.orderBy({ last_active_at: 'ASC' });
        } else if (req.before) {
            query.andWhere('last_active_at < :before', { before: moment(+req.before).toDate() });
        }

        query.limit(req.limit + 1);

        let result = await query.getMany();
        const sizeOfListChannels = result.length;
        if (!req.after && !req.before) {
            // console.log({ test: moment(result[sizeOfListChannels - 1].lastActiveAt).toDate() });
            // Convert lastActiveAt from Date to Unix timestamp
            // 2024-03-15T00:29:18.430Z
            meta.prev = '';
            meta.next = '';
            if (sizeOfListChannels === Number(req.limit) + 1) {
                meta.next = stringify({
                    before: new Date(result[sizeOfListChannels - 1].lastActiveAt).valueOf(),
                    limit: Number(req.limit),
                });
                result.splice(-1, 1);
            }
        } else if (req.before) {
            meta.next = '';
            meta.prev = stringify({
                after: req.before,
                limit: Number(req.limit),
            });
            if (sizeOfListChannels === Number(req.limit) + 1) {
                meta.next = stringify({
                    before: new Date(result[sizeOfListChannels - 1].lastActiveAt).valueOf(),
                    limit: Number(req.limit),
                });
                result.splice(-1, 1);
            }
        } else if (req.after) {
            result = result.reverse();
            meta.prev = '';
            meta.next = stringify({
                before: req.after,
                limit: Number(req.limit),
            });
            if (sizeOfListChannels === Number(req.limit) + 1) {
                result.splice(0, 1);
                meta.prev = stringify({
                    after: new Date(result[0].lastActiveAt).valueOf(),
                    limit: Number(req.limit),
                });
            }
        }
        return { data: result, meta };
    }

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
        const byteaValue = Buffer.from(id);
        return this.channelsRepository.createQueryBuilder().where('key = :id', { id: byteaValue }).getOne();
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
        const channelKey = `channel:${data.channel_key}`;
        const channelDataInRedis = await RedisAdapter.hget(channelKey, keyCheckUserInChannel);
        if (!channelDataInRedis) {
            const participants = JSON.parse((await RedisAdapter.hget(channelKey, 'participants')) as string);
            console.log({ participants });
            if (participants && participants.filter((e) => e.id === data.sender.id).length > 0) {
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
            channel_key: data.channel_key,
            message: data.message,
            message_type: data.message_type,
            sender: data.sender,
            sequence: await this.getSequenceForChannel(data.channel_key),
            sent_at: data.sent_at,
        };

        await (
            await this.queueService.getQueue<IJobPreprocessChannelMessage>(JOB_PREPROCESS_CHANNEL_MESSAGE)
        ).add(JOB_PREPROCESS_CHANNEL_MESSAGE, preprocessChannelMessageDataJob);

        return preprocessChannelMessageDataJob as IChannelMessagesResponse;
    }

    async findOrCreateChannel(channelId: string, channelMessage: IChannelMessagesResponse): Promise<void> {
        try {
            const data = await RedisAdapter.hmget(`channel:${channelId}`, ['temporary', 'direct_key', 'participants']);
            const temporary = data[`temporary`];
            console.log({ temporary });
            if (temporary === '1') {
                const directKey = data[`direct_key`];
                const participants = [];

                const channelMembers = JSON.parse(data[`participants`]);
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
                    key: channelId,
                    keyChannel: JSON.parse(directKey.toString()),
                    lastSequence: channelMessage.sequence,
                    lastMessage: channelMessage as unknown as ILastMessage,
                    participants: Object.values(participants),
                    channelType: ChannelType.DIRECT,
                };

                // race condition ???
                const channelData = await this.createNewChannel(channel as Channel);
                const user1 = participants[0];
                const user2 = participants[1];

                const iParticipants = [];

                const lastActivityAt = new Date();

                const channelKey = JSON.parse(directKey.toString());

                const participantUser1 = {
                    userId: user1.id,
                    channelId: channelData.id,
                    channelName: user2.name ? user2.name : 'user',
                    channelAvatar: user2.avatar,
                    lastSeen: 0,
                    lastActiveAt: lastActivityAt,
                    lastSequence: channelMessage.sequence,
                    unReadCount: channelMessage.sequence,
                    lastMessage: channelMessage as unknown as ILastMessage,
                    otherLastSeen: 0,
                };
                iParticipants.push(participantUser1);

                const participantUser2 = {
                    userId: user2.id,
                    channelId: channelData.id,
                    channelName: user1.name ? user1.name : 'user',
                    channelAvatar: user1.avatar,
                    lastSeen: 0,
                    lastActivityAt: lastActivityAt,
                    lastSequence: channelMessage.sequence,
                    unreadCount: channelMessage.sequence,
                    lastMessage: channelMessage as unknown as ILastMessage,
                    otherLastSeen: 0,
                };
                iParticipants.push(participantUser2);

                await this.participantService.createParticipants(iParticipants);

                await RedisAdapter.hset(`channel:${channelId}`, 'temporary', '0');
            }
        } catch (err) {
            Logger.error(`Create channel error: `, err);
        }
    }

    async createNewChannel(channel: Channel): Promise<Channel> {
        const channels = await this.channelsRepository
            .createQueryBuilder()
            .insert()
            .values(channel)
            .onConflict(
                `("key") DO UPDATE 
                SET 
                    "last_sequence" = EXCLUDED."last_sequence",
                    "last_message" = EXCLUDED."last_message"`,
            )
            .execute();
        return channels.raw[0];
    }

    async updateLastMessage(channelId: number, channelMessage: ISaveMessage): Promise<void> {
        await this.channelsRepository
            .createQueryBuilder()
            .update()
            .set({ lastSequence: channelMessage.sequence, lastMessage: channelMessage as unknown as ILastMessage })
            .where('id = :id AND last_sequence < :sequence', { id: channelId, sequence: channelMessage.sequence })
            .execute();
    }
}
