import { Logger } from '@nestjs/common';
import { Job, SandboxedJob } from 'bullmq';
import { EventEmitter2 } from 'eventemitter2';
import { USER_CREATED_EVENT } from './listeners/user-created.listener';

const eventEmitter = new EventEmitter2();
export default async function (job: SandboxedJob) {
    const logger = new Logger('User Processor');
    console.log('User Processor');

    switch (job.name) {
        case 'test':
            console.log({ name: job.name });
            eventEmitter.emit(USER_CREATED_EVENT, { name: 'test' });
            return 1;
        default:
            throw new Error('No job name match');
    }

    async function handlerSomething() {}
}
