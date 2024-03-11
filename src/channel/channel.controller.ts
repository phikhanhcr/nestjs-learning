import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    Request,
    UseGuards,
    NestMiddleware,
    UseInterceptors,
    UsePipes,
    Logger,
    Response,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, SendMessageDto } from './dto/channel.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { UserGuard } from 'src/user/user.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserMiddleware } from 'src/user/user.middleware';
import { AddSenderInformationMiddleware } from './channel.middleware';
import { AddSenderInformationInterceptor } from './AddSenderInformationInterceptor';
import httpStatus from 'http-status';
import { APIError } from 'src/common/error/api.error';
import { ObjectId } from 'bson';
import { ErrorCode } from 'src/config/errors';
export const MESSAGE_NONCE_TTL = 7200; // 2H
@Controller('chat/channels')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}

    @Get()
    @UseGuards(AuthGuard)
    @UseInterceptors(AddSenderInformationInterceptor)
    async getAllChannel(@Request() req) {
        return 'ple';
    }

    @Post()
    @UseGuards(UserGuard, AuthGuard)
    @UseInterceptors(AddSenderInformationInterceptor)
    async createChannel(@Request() req, @Body() createChannel: CreateChannelDto) {
        console.log({ check: req.user });
        const result = await this.channelService.create(req.user, createChannel);
        return {
            data: result,
        };
    }

    // send message to channel
    @Post('messages')
    @UseGuards(AuthGuard)
    @UseInterceptors(AddSenderInformationInterceptor)
    async sendMessageToChannel(@Request() req, @Body() sendMessage: SendMessageDto) {
        const data = { ...req.body };
        const channelMessageId = new ObjectId();
        const returnValue = await (
            await RedisAdapter.getClient()
        ).set(`nonce:channel:message:${8}:${data.nonce}`, channelMessageId.toString(), 'EX', MESSAGE_NONCE_TTL, 'NX');
        // if (!returnValue) {
        //     Logger.error('Duplicate nonce value!');
        //     throw new APIError({
        //         message: `chat.channel.send_message.${ErrorCode.REQUEST_NOT_FOUND}`,
        //         status: httpStatus.CONFLICT,
        //         errorCode: ErrorCode.REQUEST_NOT_FOUND,
        //     });
        // }

        console.log({ returnValue });

        data.id = channelMessageId.toHexString();

        const dataSendMessage = {
            id: data.id,
            nonce: data.nonce,
            sender: data.sender,
            channel_key: data.channel_id,
            message_type: data.message_type,
            message: data.message,
            sent_at: data.sent_at,
        };

        console.log({ dataSendMessage });
        const result = await this.channelService.sendMessageToChannel(dataSendMessage);
        return result;
    }
}
