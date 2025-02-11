import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from 'src/dto/user/create-user.dto';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(relations?: string[]): Promise<User[]> {
    return this.userRepository.find({ relations });
  }

  findOne(id: number, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations });
  }

  findByEmail(email: string, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User> | null> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }
}
