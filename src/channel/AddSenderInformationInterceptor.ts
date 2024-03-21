import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class AddSenderInformationInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const { user } = req;

        req.body.sender = {
            id: user.id,
            name: user.name,
        };
        req.body.nonce = +req.body.nonce;
        req.body.sent_at = Date.now();

        const now = Date.now();
        return next.handle().pipe(
            map((data) => {
                return data;
            }),
        );
    }
}
