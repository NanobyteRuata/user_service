import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { Self } from 'src/auth/auth.constant';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Self()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Self()
  @Patch(':id')
  update(@Param('id') id: number, @Body() payload: UpdateUserDto) {
    return this.usersService.update(id, payload);
  }

  @Self()
  @Delete(':id')
  deactivate(@Param('id') id: number) {
    return this.usersService.deactivate(id);
  }

  @Self()
  @Delete(':id/hard-delete')
  delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }
}
