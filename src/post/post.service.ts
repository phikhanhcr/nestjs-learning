import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
    private readonly config: any;
    constructor(
        @Inject('OPTIONS') private options: any,
        // @Inject('POST_OPTIONS') private userService: UserService,
        @Inject(forwardRef(() => UserService)) private userService2: UserService,
    ) {
        this.config = options;
    }
    async getPosts(): Promise<string> {
        const data = await this.userService2.findAll();
        return 'get post';
    }
}
