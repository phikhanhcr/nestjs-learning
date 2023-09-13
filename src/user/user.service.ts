import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}
    getUserById(id: number): string {
        console.log({ id });
        return 'hi';
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }
}
