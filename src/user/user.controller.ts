import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, GetUserByIdDto } from './dto/user.dto';
import { UserGuard } from './user.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll(): string {
        return this.userService.getUserById(1);
    }

    @Get(':id')
    getById(@Param('id') param: GetUserByIdDto): string {
        console.log({ param });
        return this.userService.getUserById(+param.id);
    }

    @Post('create')
    @UseGuards(UserGuard)
    create(@Body(new ValidationPipe()) createUserDto: CreateUserDto): string {
        console.log({ createUserDto });
        return 'create';
    }
}
