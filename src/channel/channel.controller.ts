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
import { AddSenderInformationInterceptor } from './channel.interceptor';
import httpStatus from 'http-status';
import { APIError } from 'src/common/error/api.error';
import { ObjectId } from 'bson';
import { ErrorCode } from 'src/config/errors';
export const MESSAGE_NONCE_TTL = 7200; // 2H
@Controller('chat/channels')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @Get()
    async getAllChannel(@Request() req): Promise<string> {
        return 'ple';
    }

    @Post('/')
    @UseGuards(UserGuard, AuthGuard)
    async createChannel(@Request() req, @Body() createChannel: CreateChannelDto) {
        console.log({ check: req.user });
        const result = this.channelService.create(req.user, createChannel);

        return {
            data: result,
        };
    }

    // send message to channel

    @Post('/message')
    @UseGuards(UserGuard, AuthGuard)
    @UseInterceptors(AddSenderInformationInterceptor)
    async sendMessageToChannel(@Request() req, @Response() res, @Body() sendMessage: SendMessageDto) {
        const data = { ...req.body };
        const channelMessageId = new ObjectId();
        const returnValue = await (
            await RedisAdapter.getClient()
        ).set(`nonce:channel:message:${8}:${data.nonce}`, channelMessageId.toString(), 'EX', MESSAGE_NONCE_TTL, 'NX');

        if (!returnValue) {
            Logger.error('Duplicate nonce value!');
            throw new APIError({
                message: `chat.channel.send_message.${ErrorCode.REQUEST_NOT_FOUND}`,
                status: httpStatus.CONFLICT,
                errorCode: ErrorCode.REQUEST_NOT_FOUND,
            });
        }

        data.id = channelMessageId.toHexString();

        const dataSendMessage = {
            id: data.id,
            nonce: data.nonce,
            sender: data.sender,
            channel_id: data.channel_id,
            message_type: data.message_type,
            message: data.message,
            sent_at: data.sent_at,
        };

        const result = this.channelService.sendMessageToChannel(dataSendMessage);

        res.sendJson({
            error_code: 0,
            message: req.i18n.t(`chat.channel.send_message.0`),
            data: result,
        });
        return 'ple';
    }
}
