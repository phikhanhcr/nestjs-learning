import { Body, Controller, Get, Post, Request, UseGuards, UseInterceptors, Logger, Query } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto, GetListChannelDto, GetMessageFromChannel, SendMessageDto } from './dto/channel.dto';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { UserGuard } from 'src/user/user.guard';
import { AuthGuard } from 'src/auth/auth.guard';
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
    @UseGuards(UserGuard, AuthGuard)
    async listChannels(@Request() req, @Query() getListChannelDto: GetListChannelDto) {
        const user = req.user;
        const result = await this.channelService.listChannels(user, getListChannelDto);
        return {
            data: result.data.map((ele) => ele.transform()),
            mete: result.meta,
        };
    }

    @Post()
    @UseGuards(UserGuard, AuthGuard)
    @UseInterceptors(AddSenderInformationInterceptor)
    async createChannel(@Request() req, @Body() createChannel: CreateChannelDto) {
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
        ).set(
            `nonce:channel:message:${channelMessageId}:${data.nonce}`,
            channelMessageId.toString(),
            'EX',
            MESSAGE_NONCE_TTL,
            'NX',
        );
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
            channel_key: data.channel_id,
            message_type: data.message_type,
            message: data.message,
            sent_at: data.sent_at,
        };

        const result = await this.channelService.sendMessageToChannel(dataSendMessage);
        return result;
    }

    @Get('/messages')
    @UseGuards(AuthGuard)
    async getMessageFromChannel(@Request() req, @Query() getMessageFromChannel: GetMessageFromChannel) {
        const user = req.user;
        const result = await this.channelService.getMessageFromChannel(user, getMessageFromChannel);
        return {
            data: result.data.map((ele) => ele.transform()),
            mete: result.meta,
        };
    }
}
