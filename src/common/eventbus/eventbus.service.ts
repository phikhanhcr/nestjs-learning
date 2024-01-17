import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class EventsService {
    eventEmitter: EventEmitter2;

    constructor() {
        this.eventEmitter = new EventEmitter2();
    }
}
