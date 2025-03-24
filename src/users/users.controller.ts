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
import { UpdateUserDto } from 'src/users/dtos/requests/update-user.dto';
import { Admin, Self } from 'src/auth/auth.constant';
import { FindAllUsersParams } from './dtos/params/find-all-users.params';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('Bearer')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Admin()
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllUsers(@Query() { page, limit, isActive }: FindAllUsersParams) {
    return this.usersService.findAllUsers({ page, limit }, { isActive });
  }

  @Admin()
  @Self()
  @Get(':userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findUserById(@Param('userId') userId: number) {
    return this.usersService.findUserById(userId);
  }

  @Admin()
  @Self()
  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateUser(@Param('userId') userId: number, @Body() payload: UpdateUserDto) {
    return this.usersService.updateUser(userId, payload);
  }

  @Admin()
  @Self()
  @Delete(':userId')
  @ApiOperation({ summary: 'Deactivate a user by ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deactivateUser(@Param('userId') userId: number) {
    return this.usersService.deactivateUser(userId);
  }

  @Admin()
  @Delete(':userId/hard-delete')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteUser(@Param('userId') userId: number) {
    return this.usersService.deleteUser(userId);
  }
}
