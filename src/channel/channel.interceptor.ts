import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AddSenderInformationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('Before...');
        const req = context.switchToHttp().getRequest();
        const { user } = req;

        req.body.sender = {
            id: user.id,
            name: user.name,
        };

        req.body.sent_at = Date.now();
        const now = Date.now();
        return next.handle().pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
    }
}
