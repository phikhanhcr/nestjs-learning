/* eslint-disable @typescript-eslint/ban-types */

import { IAuthUser } from 'src/auth/auth.interface';

declare global {
    namespace Express {
        interface Request {
            user?: IAuthUser;
        }
    }
}

export {};
