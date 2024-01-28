import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './entity/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Message])],
    providers: [MessageService],
})
export class MessageModule {}
