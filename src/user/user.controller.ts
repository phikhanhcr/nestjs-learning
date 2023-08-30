import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, GetUserByIdDto } from './dto/user.dto';
import { UserGuard } from './user.guard';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@config/config.type';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private configService: ConfigService<AllConfigType>,
    ) {}

    @Get()
    findAll(): string {
        return this.userService.getUserById(1);
    }

    // in the query string, everything is string, need to cast to number
    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number): string {
        console.log({ id });
        console.log({ config: this.configService.get('database.host', { infer: true }) });

        return this.userService.getUserById(id);
    }

    @Post('create')
    @UseGuards(UserGuard)
    // if defining in global scope, no need to use this decorator
    // @UsePipes(new ValidationPipe())
    create(@Body() createUserDto: CreateUserDto): string {
        console.log({ createUserDto });
        const data = plainToClass(CreateUserDto, createUserDto);
        console.log({ data });
        return 'create';
    }
}
