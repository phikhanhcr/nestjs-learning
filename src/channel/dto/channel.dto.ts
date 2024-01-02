import { IsNotEmpty, Max, Min } from 'class-validator';
import { ChannelMessageType, ChannelType } from '../entities/channel.entity';
export class CreateChannelDto {
    @IsNotEmpty()
    type: ChannelType;

    @IsNotEmpty()
    members: number[];
}

export class SendMessageDto {
    @IsNotEmpty()
    nonce: number;

    @IsNotEmpty()
    channel_id: string;

    // @Max(1000)
    // @Min(1)
    message: string;

    @IsNotEmpty()
    message_type: ChannelMessageType;
}
