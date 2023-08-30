import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, Max, Min } from 'class-validator';

export class GetUserByIdDto {
    @IsNumber()
    id: number;
}

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsNumber()
    age: number;

    @Expose()
    @IsNotEmpty()
    password: string;
}
