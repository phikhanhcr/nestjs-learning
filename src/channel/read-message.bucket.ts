import _, { orderBy, throttle } from 'lodash';
import { ParticipantService } from 'src/participant/participant.service';
import { IReadMessage } from './channel.interface';
import { Participant } from 'src/participant/entity/participant.entity';
import { ChannelService } from './channel.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

export let DIRECT_PARTICIPANT_BUCKET: Map<string, number> = new Map<string, number>();

export const updateLastSeen = async () => {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    const participantService = appContext.get(ParticipantService);
    await participantService.bulkUpdatelastSeen(DIRECT_PARTICIPANT_BUCKET);
    DIRECT_PARTICIPANT_BUCKET.clear();
    return true;
};

export const UpdateLastSeenToParticipantThrottled = throttle(updateLastSeen, 1000, {
    leading: false,
    trailing: true,
});

export const PushLastSeenToParticipantBucket = (readMessage: IReadMessage) => {
    const key = `${readMessage.user_id}:${readMessage.channel_id}`;
    const currentBucket = DIRECT_PARTICIPANT_BUCKET;
    const existData = currentBucket.get(key);
    if (existData === null || existData === undefined || existData < readMessage.sequence) {
        currentBucket.set(key, readMessage.sequence);
    }
    UpdateLastSeenToParticipantThrottled();
    return readMessage;
};
