import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, Scope } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_CREATED_EVENT } from './listeners/user-created.listener';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { IUserInformation } from './user.interface';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { USER_PROCESSOR } from 'src/config/job.interface';
import { Queue } from 'bullmq';
import { EventBus } from '@nestjs/cqrs';
import eventbus from 'src/common/eventbus';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

const USER_INFORMATION_TTL = 1800; // 30p

@Injectable({})
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private eventEmitter: EventEmitter2,
        private readonly httpService: HttpService,
        private configService: ConfigService<AllConfigType>,
    ) {}
    async getUserById(): Promise<string> {
        console.log('job add');

        this.eventEmitter.emit(USER_CREATED_EVENT, { name: 'test' });
        return 'hi';
    }

    async findAll(): Promise<User[]> {
        const newData = await this.usersRepository.save(
            this.usersRepository.create({
                name: 'ahgihi',
            }),
        );
        const users = await this.usersRepository.find();
        this.eventEmitter.emit(USER_CREATED_EVENT, {
            users,
        });
        return users;
    }

    async getUserInformation(userId: number): Promise<IUserInformation> {
        try {
            let userInformation = (await RedisAdapter.get(`user_info:${userId}`, true)) as IUserInformation;
            if (!userInformation) {
                userInformation = await this.getUserInformationAPI(userId);
                if (userInformation) {
                    await RedisAdapter.set(`user_info:${userId}`, userInformation, USER_INFORMATION_TTL, true);
                    return userInformation;
                } else {
                    return null;
                }
            }
            return userInformation;
        } catch (error) {
            return null;
        }
    }

    async getUserInformationAPI(userId: number): Promise<IUserInformation> {
        try {
            let url = `${this.configService.get('app.userServiceUrl', { infer: true })}`;
            url += `/users/${userId}`;

            const header = {
                headers: {
                    'x-bitu-api-key': `${this.configService.get('app.userServiceApiKey', { infer: true })}`,
                },
            };

            const dataAPI = await lastValueFrom(this.httpService.get(url, header).pipe(map((res) => res.data)));
            // get data from api
            const { data, error_code } = dataAPI;
            if (error_code === 0) {
                const userInformation = {} as IUserInformation;
                userInformation.id = data.id;
                userInformation.name = data.name;
                userInformation.avatar = data.avatar;
                userInformation.bio = data.bio;
                userInformation.is_private = data.is_private;
                return userInformation;
            }
        } catch (error) {
            Logger.error("Can't get user data from API", error);
        }
        return null;
    }
}
