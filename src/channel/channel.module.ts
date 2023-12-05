import { DynamicModule, MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { ParticipantService } from 'src/participant/participant.service';
import { ParticipantModule } from 'src/participant/participant.module';
import { Participant } from 'src/participant/entity/participant.entity';

@Module({
    controllers: [ChannelController],
    providers: [ChannelService, ParticipantService, AuthService],
    imports: [
        TypeOrmModule.forFeature([Channel]),
        TypeOrmModule.forFeature([Participant]),
        forwardRef(() => ParticipantModule),
    ],
    exports: [ChannelService],
})
export class ChannelModule {}
// export class ChannelModule implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer.apply(AuthMiddleware).forRoutes('channels');
//     }
// }
