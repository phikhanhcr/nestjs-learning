import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueService } from 'src/infrastructure/queue.service';
import {
    IJobPreprocessChannelMessage,
    IJobSaveMessageToDB,
    JOB_PREPROCESS_CHANNEL_MESSAGE,
    JOB_SAVE_MESSAGE_TO_DB,
    JOB_UPDATE_LAST_SEEN_PARTICIPANTS,
} from 'src/config/job.interface';
import { UserService } from 'src/user/user.service';
import { IChannelMessagesResponse, IReadMessage } from 'src/channel/channel.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ChannelService } from 'src/channel/channel.service';
import { ChannelType } from 'src/channel/entity/channel.entity';
@Injectable()
export class ProcessChannelMessageJob implements OnApplicationBootstrap {
    private static connectionOps = {
        connection: {
            host: 'localhost',
            port: 6379,
        },
        concurrency: 1,
    };
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly queueService: QueueService,
        private readonly userService: UserService,
        private readonly channelService: ChannelService,
    ) {}
    async onApplicationBootstrap() {
        this.listen();
    }

    listen() {
        const worker = new Worker(
            JOB_PREPROCESS_CHANNEL_MESSAGE,
            async (job: Job<IJobPreprocessChannelMessage>) => {
                this.process(job);
            },
            ProcessChannelMessageJob.connectionOps,
        );
        worker.on('completed', (job) => {
            Logger.debug(`Job completed with result ${job.returnvalue}`);
        });
        worker.on('failed', (job, err) => {
            Logger.debug(`Job failed with reason ${err}`);
        });
    }

    async process(job: Job<IJobPreprocessChannelMessage>) {
        Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);

        const preprocessMessageData = job.data;
        const channelMessageData = job.data as IChannelMessagesResponse;

        // get sender information
        const userInformation = await this.userService.getUserInformation(preprocessMessageData.sender.id);
        if (userInformation) {
            channelMessageData.sender.name = userInformation.name;
            channelMessageData.sender.avatar = userInformation.avatar;
        }

        // check participant in channel
        // create participant
        // if participant is not existed => create new, last_seen = 0
        await this.channelService.findOrCreateChannel(channelMessageData.channel_key, channelMessageData);

        // const dataRedis = await RedisAdapter.hmget(`channel:${channelMessageData.channel_key}`, [
        //     'direct_key',
        //     'participants',
        // ]);

        const findChannel = await this.channelService.findChannelByKey(channelMessageData.channel_key);
        const readMessage = {
            channel_id: findChannel.id,
            sequence: channelMessageData.sequence,
            user_id: channelMessageData.sender.id,
        };

        const saveMessageData = {
            ...channelMessageData,
            channel_id: findChannel.id,
        };
        delete saveMessageData.channel_key;

        await Promise.all([
            // update last sequence in channel first
            (await this.queueService.getQueue<IJobSaveMessageToDB>(JOB_SAVE_MESSAGE_TO_DB)).add(
                JOB_SAVE_MESSAGE_TO_DB,
                saveMessageData,
            ),
            (await this.queueService.getQueue<IReadMessage>(JOB_UPDATE_LAST_SEEN_PARTICIPANTS)).add(
                JOB_UPDATE_LAST_SEEN_PARTICIPANTS,
                readMessage,
            ),
        ]);
    }
}
