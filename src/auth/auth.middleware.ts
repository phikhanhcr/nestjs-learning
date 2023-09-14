import { ErrorCode } from '@config/errors';
import { HttpException, HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { APIError } from '@common/error/api.error';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) {}
    async use(req: any, res: any, next: () => void) {
        // do something here
        if (!req.headers.authorization) {
            throw new HttpException(
                {
                    status: HttpStatus.UNAUTHORIZED,
                    error: 'Login di eim djtcu',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
        const user = await this.authService.getAuthInfoFromToken(req.headers.authorization.split(' ')[1]);
        console.log('user');
        console.log({ user });
        if (!user) {
            throw new APIError({
                message: 'common.unauthorized',
                status: HttpStatus.UNAUTHORIZED,
                errorCode: ErrorCode.REQUEST_UNAUTHORIZED,
            });
        }
        req.user = user;
        next();
    }
}
