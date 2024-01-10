import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { USER_CREATED_EVENT } from 'src/user/listeners/user-created.listener';

@Injectable()
export class WorkerService implements OnModuleInit {
    constructor(private eventEmitter: EventEmitter2) {}
    onModuleInit() {
        this.eventEmitter.on(USER_CREATED_EVENT, (data) => {
            // Handle the event here
            console.log('User created event received:', data);
        });
    }
}
