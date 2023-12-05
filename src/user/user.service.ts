import { BullModule } from '@nestjs/bull';
import { Injectable, Scope } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_CREATED_EVENT } from './listeners/user-created.listener';

@Injectable({
    scope: Scope.DEFAULT,
})
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectQueue('user') private readonly userQueue: Queue,
        private eventEmitter: EventEmitter2,
    ) {}
    count = 1;
    getUserById(id: number): string {
        return 'hi';
    }

    async findAll(): Promise<User[]> {
        // await this.userQueue.add(
        //     'transcode',
        //     {
        //         file: 'audio.mp3',
        //     },
        //     {
        //         delay: 3000,
        //     },
        // );
        // console.log({ count: this.count });
        // this.count++;
        const newData = await this.usersRepository.save(
            this.usersRepository.create({
                name: 'ahgihi',
            }),
        );
        console.log({ newData });
        const users = await this.usersRepository.find();
        this.eventEmitter.emit(USER_CREATED_EVENT, {
            users,
        });
        return users;
    }
}
