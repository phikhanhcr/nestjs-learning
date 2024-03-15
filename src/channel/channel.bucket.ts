import { NestFactory } from '@nestjs/core';
import { throttle } from 'lodash';
import { AppModule } from 'src/app.module';
import { IJobSaveMessageToDB } from 'src/config/job.interface';
import { ParticipantService } from 'src/participant/participant.service';
import { ChannelService } from './channel.service';
import { ISaveMessage } from 'src/message/entity/message.entity';

export let CHANNEL_BUCKET: Map<number, ISaveMessage> = new Map<number, ISaveMessage>();

const saveLastMessageChannel = async () => {
    const tmp = new Map(CHANNEL_BUCKET);
    CHANNEL_BUCKET.clear();
    const keys = Array.from(tmp.keys());

    const appContext = await NestFactory.createApplicationContext(AppModule);
    const participantService = appContext.get(ParticipantService);
    const channelService = appContext.get(ChannelService);
    await Promise.all(
        keys.map(async (key) => {
            await channelService.updateLastMessage(key, tmp.get(key));
            await participantService.updateLastMessageAndUnReadCount(key, tmp.get(key));
        }),
    );
    return true;
};

export const SaveChannelLastMessageAsBatchThrottled = throttle(saveLastMessageChannel, 1000, {
    leading: false,
    trailing: true,
});

export const PushLastMessageToBucket = (channelMessage: ISaveMessage) => {
    const existData = CHANNEL_BUCKET.get(channelMessage.channel_id);
    if (existData === null || existData === undefined || existData.sequence < channelMessage.sequence) {
        CHANNEL_BUCKET.set(channelMessage.channel_id, channelMessage);
    }
    SaveChannelLastMessageAsBatchThrottled();

    return channelMessage;
};
