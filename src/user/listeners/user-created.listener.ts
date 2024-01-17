import { Injectable, Scope } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IUserCreatedEvent } from '../events/user-created.event';
import { UserQueueBackgroundService } from 'src/worker/user/queue.service';

export const USER_CREATED_EVENT = 'user-created';

@Injectable()
export class UserEvent {
    constructor(private readonly userBackgroundService: UserQueueBackgroundService) {}

    @OnEvent(USER_CREATED_EVENT)
    handleOrderCreatedEvent(event: IUserCreatedEvent) {
        console.log(event);
        console.log(USER_CREATED_EVENT);
        this.userBackgroundService.sendEmailGreeting({ name: 'test' });
    }

    @OnEvent('test')
    handleOrderCreatedEventhihi(event: IUserCreatedEvent) {
        console.log('test worker');
    }
}
