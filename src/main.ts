import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService<AllConfigType>);
    app.useGlobalPipes(
        new ValidationPipe({
            disableErrorMessages: false,
            // like convert string to number
            // transform: true,
        }),
    );
    await app.listen(configService.get('app.port', { infer: true }), () => {
        // console.log(`Server is listening on port ${configService.get('app.port', { infer: true })}`);
        Logger.log(`Server is listening on port ${configService.get('app.port', { infer: true })}`);
    });
}
bootstrap();
