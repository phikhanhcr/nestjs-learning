import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entity/message.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
    ) {}

    async saveMessageToDB(message: Message): Promise<void> {
        console.log({ message });
        await this.messagesRepository.save({
            ...message,
        });
    }
}
