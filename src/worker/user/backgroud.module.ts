import { Module } from '@nestjs/common';
import { UserWorkerBackgroundService } from './background.service';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { QueueService } from '../../infrastructure/queue.service';
import { UserEvent } from 'src/user/listeners/user-created.listener';

@Module({
    providers: [UserWorkerBackgroundService, UserEvent, QueueService],
    imports: [],
})
export class UserBackgroundModule {}
