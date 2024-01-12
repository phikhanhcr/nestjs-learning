import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IUserCreatedEvent } from '../events/user-created.event';

export const USER_CREATED_EVENT = 'user-created';

@Injectable()
export class UserEvent {
    @OnEvent(USER_CREATED_EVENT)
    handleOrderCreatedEvent(event: IUserCreatedEvent) {
        console.log(event);
        console.log(USER_CREATED_EVENT);
    }
}
