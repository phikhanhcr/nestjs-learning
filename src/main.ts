import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './config/config.type';
import { RedisAdapter } from './infrastructure/redis/redis.adapter';
import { USER_CREATED_EVENT } from './user/listeners/user-created.listener';
import eventbus from './common/eventbus';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await RedisAdapter.connect();
    const configService = app.get(ConfigService<AllConfigType>);
    app.useGlobalPipes(
        new ValidationPipe({
            disableErrorMessages: false,
            // like convert string to number
            // transform: true,
        }),
    );

    // TestEvent.register();

    await app.listen(configService.get('app.port', { infer: true }), () => {
        Logger.log(`Server is listening on port ${configService.get('app.port', { infer: true })}`);
    });
}
bootstrap();
