import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
    CHANNEL_PROCESSOR,
    IJobPreprocessChannelMessage,
    JOB_PREPROCESS_CHANNEL_MESSAGE,
} from 'src/config/job.interface';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { UserService } from 'src/user/user.service';
import { ChannelService } from './channel.service';
import { IChannelMessagesResponse } from './channel.interface';

@Processor(CHANNEL_PROCESSOR)
export class ChannelProcessor {
    constructor(
        private readonly userService: UserService,
        private readonly channelService: ChannelService,
    ) {}
    private readonly logger = new Logger(ChannelProcessor.name);

    // @Process(JOB_PREPROCESS_CHANNEL_MESSAGE)
    async handleTranscode(job: Job<IJobPreprocessChannelMessage>) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);

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
            (await RedisAdapter.hget(`channel:${preprocessMessageData.channel_id}`, 'direct_key')) as string,
        );

        if (!channelRedis) {
            channelRedis = await this.channelService.findChannelByKey(preprocessMessageData.channel_id);
        }

        // clean message => later

        await this.channelService.findOrCreateChannel(channelMessageData.channel_id, channelMessageData);

        const dataRedis = await RedisAdapter.hmget(`channel:${channelMessageData.channel_id}`, [
            'direct_key',
            'participants',
        ]);

        console.log({ dataRedis });
        // const directKey = JSON.parse(dataRedis[`direct_key`]) as IDirectKeyRedis;
        // const readMessage = {
        //     channel_id: channelMessageData.channel_id,
        //     sequence: channelMessageData.sequence,
        //     user_id: channelMessageData.sender.id,
        // };
    }
}
