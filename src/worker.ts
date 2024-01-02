import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { WorkerModule } from './worker/worker.module';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
    await NestFactory.create<NestExpressApplication>(WorkerModule);
    Logger.debug('The worker was started successfully!');
}
bootstrap();
