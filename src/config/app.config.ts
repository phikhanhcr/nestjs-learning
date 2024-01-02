import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariablesValidator {
    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment;

    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    APP_PORT: number;

    @IsString()
    @IsOptional()
    USER_SERVICE_URL: string;

    @IsString()
    @IsOptional()
    USER_SERVICE_API_KEY: string;
}

export default registerAs<AppConfig>('app', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        name: process.env.APP_NAME || 'app',
        workingDirectory: process.env.PWD || process.cwd(),
        port: process.env.APP_PORT
            ? parseInt(process.env.APP_PORT, 10)
            : process.env.PORT
            ? parseInt(process.env.PORT, 10)
            : 3000,
        userServiceUrl: process.env.USER_SERVICE_URL,
        userServiceApiKey: process.env.USER_SERVICE_API_KEY,
    };
});
