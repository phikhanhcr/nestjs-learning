import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
    providers: [
        AuthService,
        {
            provide: 'APP_GUARD',
            useClass: AuthGuard,
        },
    ],
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_PUBLIC_KEY,
            // signOptions: { expiresIn: '60s' },
        }),
    ],
})
export class AuthModule {}
