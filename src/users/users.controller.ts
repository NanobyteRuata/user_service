import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { Admin, Self } from 'src/auth/auth.constant';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Admin()
  @Get('')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.usersService.findAll({ page, limit }, { isActive });
  }

  @Admin()
  @Self()
  @Get(':userId')
  findOne(@Param('userId') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Admin()
  @Self()
  @Patch(':userId')
  update(@Param('userId') userId: number, @Body() payload: UpdateUserDto) {
    return this.usersService.update(userId, payload);
  }

  @Admin()
  @Self()
  @Delete(':userId')
  deactivate(@Param('userId') userId: number) {
    return this.usersService.deactivate(userId);
  }

  @Admin()
  @Delete(':userId/hard-delete')
  delete(@Param('userId') userId: number) {
    return this.usersService.delete(userId);
  }
}
