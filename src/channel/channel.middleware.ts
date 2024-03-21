import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AddSenderInformationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { user } = req;

        req.body.sender = {
            id: user.id,
            name: user.name,
        };

        req.body.sent_at = Date.now();
        next();
    }
}
