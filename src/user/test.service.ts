// some-other-file.ts

import { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { USER_CREATED_EVENT } from './listeners/user-created.listener';

const eventEmitter = new EventEmitter2();

@Injectable()
export class SomeOtherService implements OnModuleInit {
    onModuleInit() {
        console.log('SomeOtherService initialized');
        eventEmitter.on(USER_CREATED_EVENT, (payload) => {
            console.log('Received USER_CREATED_EVENT in another process:', payload);
            // Handle the event here
        });
    }
}
