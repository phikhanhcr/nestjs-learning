import { Logger } from '@nestjs/common';
import { Job, SandboxedJob } from 'bullmq';
import { EventEmitter2 } from 'eventemitter2';
import { USER_CREATED_EVENT } from './listeners/user-created.listener';
import { EventBus } from '@nestjs/cqrs';
import eventbus from 'src/common/eventbus';
import { EventsService } from 'src/common/eventbus/eventbus.service';
const test = new EventsService();

export default async function (job: SandboxedJob) {
    const logger = new Logger('User Processor');
    logger.log('User Processor');
    switch (job.name) {
        case 'test':
            try {
                console.log('Before event emission');
                eventbus.emit(USER_CREATED_EVENT, { name: 'test' });
                test.eventEmitter.emit(USER_CREATED_EVENT, { name: 'test' });
                console.log('After event emission');
            } catch (error) {
                console.log('Error during event emission:', error);
            }
        default:
            throw new Error('No job name match');
    }

    async function handlerSomething() {}
}

// how to run event bus in internal process in nestjs
