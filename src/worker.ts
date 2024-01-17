import { USER_CREATED_EVENT } from 'src/user/listeners/user-created.listener';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { WorkerModule } from './worker/worker.module';
import { AllConfigType } from './config/config.type';
import eventbus from './common/eventbus';

async function bootstrap() {
    await NestFactory.createApplicationContext(WorkerModule);
    Logger.debug('The worker was started successfully!');
}
bootstrap();
