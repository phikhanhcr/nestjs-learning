import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueService } from 'src/infrastructure/queue.service';
import { JOB_SAVE_MESSAGE_TO_DB } from 'src/config/job.interface';
import { UserService } from 'src/user/user.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ChannelService } from 'src/channel/channel.service';
import { IChannelMessagesResponse } from 'src/channel/channel.interface';
import { MessageService } from 'src/message/message.service';
import { ObjectId } from 'bson';
@Injectable()
export class SaveMessageToDBJob implements OnApplicationBootstrap {
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
        private readonly messageService: MessageService,
    ) {}
    async onApplicationBootstrap() {
        this.listen();
    }

    listen() {
        const worker = new Worker(
            JOB_SAVE_MESSAGE_TO_DB,
            async (job: Job<IChannelMessagesResponse>) => {
                this.process(job);
            },
            SaveMessageToDBJob.connectionOps,
        );
        worker.on('completed', (job) => {
            console.log(`Job completed with result ${job.returnvalue}`);
        });
        worker.on('failed', (job, err) => {
            console.log(`Job failed with reason ${err}`);
        });
    }

    async process(job: Job<IChannelMessagesResponse>) {
        Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);

        const channelMessageData = job.data as IChannelMessagesResponse;
        const iChannelMessage = {
            channelId: channelMessageData.channel_id,
            message: channelMessageData.message,
            messageType: channelMessageData.message_type,
            senderId: channelMessageData.sender.id,
            senderName: channelMessageData.sender.name,
            senderAvatar: channelMessageData.sender.avatar,
            sequence: channelMessageData.sequence,
            sentAt: channelMessageData.sent_at,
        } as any;

        await this.messageService.saveMessageToDB(iChannelMessage);
    }
}
