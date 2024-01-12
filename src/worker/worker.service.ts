import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';
import eventbus from 'src/common/eventbus';
import { USER_CREATED_EVENT } from 'src/user/listeners/user-created.listener';

@Injectable()
export class WorkerService {
    // constructor() {}
    // onModuleInit() {
    //     eventbus.on(USER_CREATED_EVENT, (data) => {
    //         // Handle the event here
    //         console.log('User created event received:', data);
    //     });
    // }
    @OnEvent(USER_CREATED_EVENT)
    handleUserCreatedEvent(payload: any) {
        console.log('User created event received:', payload);
    }
}
