import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// @Injectable()
// export class UserMiddleware implements NestMiddleware {
//     use(req: any, res: any, next: () => void) {
//         next();
//     }
// }

export function UserMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
}
