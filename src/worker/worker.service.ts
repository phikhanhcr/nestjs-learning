import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';
import { USER_CREATED_EVENT } from 'src/user/listeners/user-created.listener';

@Injectable()
export class WorkerService {
    // do something
}
