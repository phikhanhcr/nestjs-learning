import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISaveMessage, Message } from './entity/message.entity';
import { IJobSaveMessageToDB } from 'src/config/job.interface';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
    ) {}

    async saveMessageToDB(message: ISaveMessage): Promise<void> {
        await this.messagesRepository.save({
            channelId: message.channel_id,
            message: message.message,
            messageType: message.message_type,
            sequence: message.sequence,
            sendAt: message.sent_at,
            senderId: message.sender_id,
            senderName: message.sender_name,
            senderAvatar: message.sender_avatar,
        });
    }
}
