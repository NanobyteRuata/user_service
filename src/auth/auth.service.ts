import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dtos/register.dto';
import { LoginDto } from 'src/auth/dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadUser } from './models/jwt-payload-user.model';
import { SessionsService } from 'src/sessions/sessions.service';
import { RefreshDto } from 'src/auth/dtos/refresh.dto';
import { Tokens } from './models/tokens.model';
import { ResponseFormat } from 'src/common/model/response-format.model';
import { LogoutDto } from './dtos/logout.dto';
import { UserAlreadyExistsException } from 'src/core/exceptions/user-exceptions';
import { WrongCredentialsException } from 'src/core/exceptions/auth-exceptions';
import { SessionNotFoundException } from 'src/core/exceptions/session-exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  private async validateUser(email: string, password: string): Promise<User> {
    const auth = await this.authRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (!auth || !auth.user.isActive) throw new WrongCredentialsException();

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) throw new WrongCredentialsException();

    return auth.user;
  }

  private async verifyRefreshToken(
    refreshToken: string,
    deviceId: string,
  ): Promise<JwtPayloadUser | null> {
    try {
      // Verify JWT and extract user ID
      const user: JwtPayloadUser = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const session = await this.sessionsService.getSession(user.id, deviceId);
      if (!session || !session.refreshToken) return null;

      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (!isMatch) return null;

      return user;
    } catch {
      return null;
    }
  }

  private async generateTokens(
    id: number,
    email: string,
    isAdmin: boolean = false,
  ): Promise<Tokens> {
    const payload: JwtPayloadUser = {
      id,
      email,
      isAdmin,
    };

    const sign = (secretKey: string, expiresInKey: string): Promise<string> => {
      return this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(secretKey),
        expiresIn: this.configService.get<string>(expiresInKey),
      });
    };

    const accessToken = await sign('JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRE_IN');
    const refreshToken = await sign(
      'JWT_REFRESH_SECRET',
      'JWT_REFRESH_EXPIRE_IN',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register({
    email,
    name,
    password,
  }: RegisterDto): Promise<ResponseFormat> {
    const userExists = await this.authRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (userExists) throw new UserAlreadyExistsException(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const auth = this.authRepository.create({
      user: { email, name },
      password: hashedPassword,
    });
    await this.authRepository.save(auth);
    return new ResponseFormat({
      message: 'Registered successfully!',
      data: auth.user,
    });
  }

  async login({
    email,
    password,
    deviceId,
  }: LoginDto): Promise<ResponseFormat> {
    const user = await this.validateUser(email, password);

    const tokens = await this.generateTokens(user.id, user.email, user.isAdmin);
    await this.sessionsService.upsert(user.id, tokens.refreshToken, deviceId);

    return new ResponseFormat({
      message: 'Logged in successfully!',
      data: { tokens, user },
    });
  }

  async refresh({
    deviceId,
    refreshToken,
  }: RefreshDto): Promise<ResponseFormat> {
    const user = await this.verifyRefreshToken(refreshToken, deviceId);
    if (!user) throw new SessionNotFoundException();

    const tokens = await this.generateTokens(user.id, user.email, user.isAdmin);
    await this.sessionsService.upsert(user.id, tokens.refreshToken, deviceId);

    return new ResponseFormat({
      message: 'Tokens refreshed successfully!',
      data: tokens,
    });
  }

  async logout(
    userId: number,
    { deviceId }: LogoutDto,
  ): Promise<ResponseFormat> {
    await this.sessionsService.delete(userId, deviceId);
    return new ResponseFormat({
      message: 'Logged out successfully!',
    });
  }
}
