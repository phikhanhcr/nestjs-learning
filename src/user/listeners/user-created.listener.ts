import { Injectable, Scope } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IUserCreatedEvent } from '../events/user-created.event';
import { QueueService } from 'src/infrastructure/queue.service';

export const USER_CREATED_EVENT = 'user-created';

@Injectable()
export class UserEvent {
    constructor(private readonly queueService: QueueService) {}

    @OnEvent(USER_CREATED_EVENT)
    async handleOrderCreatedEvent(event: IUserCreatedEvent) {
        await (await this.queueService.getQueue('sendMail')).add('sendMail', { user: [] });
    }

    @OnEvent('test')
    handleOrderCreatedEventhihi(event: IUserCreatedEvent) {
        console.log('test worker');
    }
}
