import { User } from '../entities/user.entity';

export interface IUserCreatedEvent {
    users: User[];
}
