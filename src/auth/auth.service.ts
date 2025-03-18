import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { ResponseFormat } from 'src/common/dto/response-format.dto';
import { LogoutDto } from './dtos/logout.dto';

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
    if (!auth || !auth.user.isActive)
      throw new UnauthorizedException('Email or password incorrect');

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch)
      throw new UnauthorizedException('Email or password incorrect');

    return auth.user;
  }

  private async verifyRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      // Verify JWT and extract user ID
      const { id }: JwtPayloadUser = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      // Fetch active sessions for the user
      const sessions = await this.sessionsService.findByUserId(id);

      // Check if the refresh token matches any valid session
      const isValid = (
        await Promise.all(
          sessions.map(
            async (session) =>
              session.refreshToken &&
              (await bcrypt.compare(refreshToken, session.refreshToken)) &&
              session.expiresAt.getTime() > Date.now(),
          ),
        )
      ).some(Boolean);

      return isValid;
    } catch {
      return false;
    }
  }

  private async generateTokens(id: number, email: string): Promise<Tokens> {
    const payload: JwtPayloadUser = {
      id,
      email,
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
    if (userExists)
      throw new BadRequestException('User with email already exists');

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

    const tokens = await this.generateTokens(user.id, user.email);
    await this.sessionsService.upsert(user.id, tokens.refreshToken, deviceId);

    return new ResponseFormat({
      message: 'Logged in successfully!',
      data: { tokens, user },
    });
  }

  async refresh(
    userId: number,
    userEmail: string,
    { deviceId, refreshToken }: RefreshDto,
  ): Promise<ResponseFormat> {
    const isRefreshTokenValid = await this.verifyRefreshToken(refreshToken);
    if (!isRefreshTokenValid)
      throw new UnauthorizedException('Session has expired');

    const tokens = await this.generateTokens(userId, userEmail);
    await this.sessionsService.upsert(userId, tokens.refreshToken, deviceId);

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
