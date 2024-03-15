import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueueService } from 'src/infrastructure/queue.service';
import { IJobSaveMessageToDB, JOB_SAVE_MESSAGE_TO_DB } from 'src/config/job.interface';
import { UserService } from 'src/user/user.service';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { ChannelService } from 'src/channel/channel.service';
import { MessageService } from 'src/message/message.service';
import { ObjectId } from 'bson';
import { PushLastMessageToBucket } from 'src/channel/channel.bucket';
import { ISaveMessage } from 'src/message/entity/message.entity';
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
            async (job: Job<IJobSaveMessageToDB>) => {
                this.process(job);
            },
            SaveMessageToDBJob.connectionOps,
        );
        worker.on('completed', (job) => {
            Logger.debug(`Job completed with result ${job.returnvalue}`);
        });
        worker.on('failed', (job, err) => {
            Logger.debug(`Job failed with reason ${err}`);
        });
    }

    async process(job: Job<IJobSaveMessageToDB>) {
        Logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);

        const channelMessageData = job.data as IJobSaveMessageToDB;
        const iChannelMessage = {
            channel_id: channelMessageData.channel_id,
            message: channelMessageData.message,
            message_type: channelMessageData.message_type,
            sender_id: channelMessageData.sender.id,
            sender_name: channelMessageData.sender.name,
            sender_avatar: channelMessageData.sender.avatar,
            sequence: channelMessageData.sequence,
            sent_at: channelMessageData.sent_at,
        } as ISaveMessage;

        await this.messageService.saveMessageToDB(iChannelMessage);

        // save last message to participant
        PushLastMessageToBucket(iChannelMessage);
    }
}
