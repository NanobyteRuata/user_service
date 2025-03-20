import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { UserNotFoundException } from 'src/core/exceptions/user-exceptions';
import { ResponseFormat } from 'src/common/model/response-format.model';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    options: IPaginationOptions,
    filters?: { isActive?: boolean },
  ): Promise<ResponseFormat> {
    const { items, meta } = await paginate<User>(
      this.userRepository,
      options,
      filters,
    );
    return new ResponseFormat({
      status: 'success',
      message: 'Users fetched successfully',
      data: items,
      pagination: meta,
    });
  }

  async findOne(id: number, relations?: string[]): Promise<ResponseFormat> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });
    if (!user) throw new UserNotFoundException(id);
    return new ResponseFormat({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseFormat> {
    const user = await this.findOne(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    return new ResponseFormat({
      status: 'success',
      message: 'User updated successfully',
      data: await this.findOne(id),
    });
  }

  async deactivate(id: number): Promise<ResponseFormat> {
    const response = await this.update(id, { isActive: false });
    response.message = 'User deactivated successfully';
    return response;
  }

  async delete(id: number): Promise<ResponseFormat> {
    const user = await this.findOne(id);
    if (!user) throw new UserNotFoundException(id);

    await this.userRepository.delete(id);

    return new ResponseFormat({
      status: 'success',
      message: 'User deleted successfully',
      data: user,
    });
  }
}
