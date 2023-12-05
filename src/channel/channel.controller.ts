import { Body, Controller, Get, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/channel.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisAdapter } from 'src/infrastructure/redis/redis.adapter';
import { UserGuard } from 'src/user/user.guard';
import { AuthGuard } from 'src/auth/auth.guard';

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
    async createChannel(@Request() req, @Body() createChannel: CreateChannelDto): Promise<string> {
        console.log({ check: req.user });
        await this.channelService.create(req.user, createChannel);
        return 'ple';
    }
}
