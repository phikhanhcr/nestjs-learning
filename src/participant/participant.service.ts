import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IUserInformation } from './../user/user.interface';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { Repository } from 'typeorm';
import { IParticipant, Participant } from './entity/participant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'bson';
import { ISaveMessage } from 'src/message/entity/message.entity';
import { ILastMessage } from 'src/channel/entity/channel.entity';

@Injectable()
export class ParticipantService {
    constructor(
        @InjectRepository(Participant)
        private participantRepository: Repository<Participant>,
        @Inject(forwardRef(() => ChannelService))
        private readonly channelService: ChannelService,
    ) {}

    async getParticipantInfo(channelId: string, userId: number): Promise<void> {
        // return await this.participantRepository.findOneBy({ channelId, userId });
    }

    async getChannelId(users: IUserInformation[]): Promise<string> {
        let mainId = users[0].id;
        let otherId = users[1].id;

        if (users[1].id < users[0].id) {
            mainId = users[1].id;
            otherId = users[0].id;
        }

        const directKeyRedis = `chat:channel:${mainId}:${otherId}`;

        let channelId = await RedisAdapter.get(directKeyRedis);
        if (channelId) {
            return channelId.toString();
        }

        // find channel by user
        const channel = await this.channelService.findChannelByDirectKey(mainId, otherId);

        if (channel) return channel.key.toString();

        channelId = new ObjectId();
        console.log({ channelId: channelId.toString() });

        Logger.log(`Create new channel ID ${channelId.toString()}`);

        const result = await (await RedisAdapter.getClient()).setnx(directKeyRedis, channelId.toString());

        if (result) {
            const channelKey = `channel:${channelId}`;

            const data: Map<string, string> = new Map<string, string>();
            data.set('temporary', '1');
            data.set('sequence', '0');

            const directKey = {
                type: directKeyRedis,
                pid1: mainId,
                pid2: otherId,
            };
            data.set('direct_key', JSON.stringify(directKey));

            const participants = [];
            participants.push({ id: mainId });
            participants.push({ id: otherId });
            data.set('participants', JSON.stringify(participants));
            data.set(`p:${mainId}`, '1');
            data.set(`p:${otherId}`, '1');

            await RedisAdapter.hmset(channelKey, data);
        } else {
            return (await RedisAdapter.get(directKeyRedis)).toString();
        }

        return channelId.toString();
    }

    async createParticipants(participants: IParticipant[]): Promise<void> {
        await this.participantRepository
            .createQueryBuilder()
            .insert()
            .into(Participant)
            .values([...participants])
            .execute();
    }

    async bulkUpdatelastSeen(bucket: Map<string, number>): Promise<void> {
        const otherTmp = new Map(bucket);
        const otherKeys = Array.from(otherTmp.keys());

        for (let i = 0; i < otherKeys.length; i++) {
            const data = otherKeys[i].split(':');
            const lastSeen = Number(otherTmp.get(otherKeys[i]));
            const executeQuery = [];
            executeQuery.push(
                this.participantRepository
                    .createQueryBuilder()
                    .update(Participant)
                    .set({
                        lastSeen,
                        lastActiveAt: new Date(),
                    })
                    .where('user_id = :userId AND channel_id = :channelId AND last_seen < :lastSeen', {
                        userId: Number(data[0]),
                        channelId: Number(data[1]),
                        lastSeen,
                    }),
                this.participantRepository
                    .createQueryBuilder()
                    .update(Participant)
                    .set({
                        otherLastSeen: lastSeen,
                    })
                    .where('user_id <> :userId AND channel_id = :channelId', {
                        userId: Number(data[0]),
                        channelId: Number(data[1]),
                    }),
            );

            await Promise.all([...executeQuery].map((query) => query.execute()));
        }
    }

    async updateLastMessageAndUnReadCount(channelId: number, channelMessage: ISaveMessage): Promise<void> {
        await this.participantRepository
            .createQueryBuilder()
            .update(Participant)
            .set({
                lastSequence: channelMessage.sequence,
                lastMessage: channelMessage as unknown as ILastMessage,
                unReadCount: () => `${channelMessage.sequence} - "last_seen"`,
            })
            .where('channel_id = :channelId AND last_sequence < :lastSequence', {
                channelId: Number(channelId),
                lastSequence: channelMessage.sequence,
            })
            .execute();
    }
}
