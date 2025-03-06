import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number, relations?: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
      updatedAt: new Date(),
    });
    return this.findOne(id);
  }

  async deactivate(id: number): Promise<User> {
    return this.update(id, { isActive: false });
  }

  async delete(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException();

    await this.userRepository.delete(id);

    return user;
  }
}
