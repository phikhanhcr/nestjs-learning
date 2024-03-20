import { IsNotEmpty, IsNumber, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ChannelMessageType, ChannelType } from '../entity/channel.entity';
import { DefaultValuePipe } from '@nestjs/common';

export class GetListChannelDto {
    limit: number;

    before: number;

    after: number;
}

export class CreateChannelDto {
    @IsNotEmpty()
    type: ChannelType;

    @IsNotEmpty()
    members: number[];
}

export class SendMessageDto {
    @IsNotEmpty()
    @IsNumber()
    nonce: number;

    @IsNotEmpty()
    channel_id: string;

    @MaxLength(1000)
    @MinLength(1)
    message: string;

    @IsNotEmpty()
    message_type: ChannelMessageType;

    sender: Object;
}
