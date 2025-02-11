import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/dto/auth/register.dto';
import { LoginDto } from 'src/dto/auth/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register({ email, name, password }: RegisterDto): Promise<User | null> {
    let user = await this.usersService.findByEmail(email);
    if (user) throw new HttpException('User with email already exists', HttpStatus.BAD_REQUEST);

    user = await this.usersService.create({ email, name });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const auth = this.authRepository.create({
      user,
      password: hashedPassword,
    });

    await this.authRepository.save(auth);
    return auth.user;
  }

  async login({
    email,
    password,
  }: LoginDto): Promise<{ access_token: string; user: User } | null> {
    const user = await this.usersService.findByEmail(email, ['auth']);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(password, user.auth!.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const jwtPayload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(jwtPayload);

    delete user.auth;

    return {
      access_token,
      user,
    };
  }

  findOne(user: User): Promise<Auth | null> {
    return this.authRepository.findOneBy({ user });
  }
}
