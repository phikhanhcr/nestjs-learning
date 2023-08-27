import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    getUserById(id: number): string {
        console.log({ id });
        return 'hi';
    }
}
