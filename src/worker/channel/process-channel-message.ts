import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueService } from 'src/infrastructure/queue.service';
import {
    IJobPreprocessChannelMessage,
    JOB_PREPROCESS_CHANNEL_MESSAGE,
    JOB_SAVE_MESSAGE_TO_DB,
} from 'src/config/job.interface';
import { UserService } from 'src/user/user.service';
import { IChannelMessagesResponse } from 'src/channel/channel.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ChannelService } from 'src/channel/channel.service';
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
            console.log(`Job completed with result ${job.returnvalue}`);
        });
        worker.on('failed', (job, err) => {
            console.log(`Job failed with reason ${err}`);
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

        // get channel information
        let channelRedis = JSON.parse(
            (await RedisAdapter.hget(`channel:${preprocessMessageData.channel_key}`, 'direct_key')) as string,
        );

        if (!channelRedis) {
            channelRedis = await this.channelService.findChannelByKey(preprocessMessageData.channel_key);
        }

        // clean message => later

        // check participant in channel
        // create participant
        // if participant is not existed => create new, last_seen = 0
        await this.channelService.findOrCreateChannel(channelMessageData.channel_key, channelMessageData);

        const dataRedis = await RedisAdapter.hmget(`channel:${channelMessageData.channel_key}`, [
            'direct_key',
            'participants',
        ]);

        console.log({ dataRedis });

        // khi gui: last_seen = 0

        // update last seen to participant
        // another job for updating last seen of participant

        await (
            await this.queueService.getQueue<IChannelMessagesResponse>(JOB_SAVE_MESSAGE_TO_DB)
        ).add(JOB_SAVE_MESSAGE_TO_DB, channelMessageData);
    }
}
