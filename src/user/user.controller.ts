import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, GetUserByIdDto } from './dto/user.dto';
import { UserGuard } from './user.guard';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private configService: ConfigService<AllConfigType>,
    ) {}

    // @Get()
    // findAll(): Promise<User[]> {
    //     return this.userService.findAll();
    // }

    // in the query string, everything is string, need to cast to number
    @Get()
    async getById(): Promise<string> {
        return await this.userService.getUserById();
    }

    @Post('create')
    // @UseGuards(UserGuard, AuthGuard)
    // if defining in global scope, no need to use this decorator
    // @UsePipes(new ValidationPipe())
    create(@Body() createUserDto: CreateUserDto): string {
        const data = plainToClass(CreateUserDto, createUserDto);
        return 'create';
    }
}
