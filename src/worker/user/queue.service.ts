import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
@Injectable()
export class UserQueueBackgroundService {
    private sendMailQueue: Queue;
    constructor() {
        this.sendMailQueue = new Queue('sendMail', {
            connection: {
                host: 'localhost',
                port: 6379,
            },
        });
    }

    async sendEmailGreeting(user: any) {
        const job = await this.sendMailQueue.add('sendMail', { user });
        console.log({ label: 'sendEmailGreeting', jobId: job.id });
    }
}
