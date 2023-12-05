import { IsNotEmpty } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';
export class CreateChannelDto {
    @IsNotEmpty()
    type: ChannelType;

    @IsNotEmpty()
    members: number[];
}
