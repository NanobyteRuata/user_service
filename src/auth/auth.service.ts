import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dtos/requests/register.dto';
import { LoginDto } from 'src/auth/dtos/requests/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadUser } from '../common/models/jwt-payload-user.model';
import { SessionsService } from 'src/sessions/sessions.service';
import { RefreshDto } from 'src/auth/dtos/requests/refresh.dto';
import { Tokens } from '../common/models/tokens.model';
import { ResponseFormat } from 'src/common/models/response-format.model';
import { LogoutDto } from './dtos/requests/logout.dto';
import { UserAlreadyExistsException } from 'src/core/exceptions/user-exceptions';
import { WrongCredentialsException } from 'src/core/exceptions/auth-exceptions';
import { SessionNotFoundException } from 'src/core/exceptions/session-exceptions';
import { v4 as uuidv4 } from 'uuid';

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
  ): Promise<JwtPayloadUser | null> {
    try {
      // Verify JWT and extract user ID
      const payload: JwtPayloadUser = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
      const { deviceId, ...user } = payload;
      if (!deviceId) return null;

      const session = await this.sessionsService.getSession(user.id, deviceId);
      if (!session || !session.refreshToken) return null;

      const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
      if (!isMatch) return null;

      return {
        ...payload,
        isAdmin: session.user?.isAdmin ?? payload.isAdmin,
      };
    } catch {
      return null;
    }
  }

  private async generateTokens(
    { id, email, isAdmin }: User | JwtPayloadUser,
    deviceId: string,
  ): Promise<Tokens> {
    const accessPayload: JwtPayloadUser = {
      id,
      email,
      isAdmin,
    };
    const refreshPayload = {
      ...accessPayload,
      deviceId, // Include deviceId in refresh token only
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateTokensAndUpsertSession(
    user: JwtPayloadUser,
    deviceId: string,
    message: string,
  ): Promise<ResponseFormat> {
    const tokens = await this.generateTokens(user, deviceId);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.sessionsService.upsert(user.id, hashedRefreshToken, deviceId);

    return new ResponseFormat({
      message,
      data: tokens,
    });
  }

  async register({ password, ...user }: RegisterDto): Promise<ResponseFormat> {
    const { email } = user;
    const userExists = await this.authRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (userExists) throw new UserAlreadyExistsException(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    // this creates user and auth at the same time
    const auth = this.authRepository.create({
      user,
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
    if (!deviceId) deviceId = uuidv4();

    return this.generateTokensAndUpsertSession(
      user,
      deviceId,
      'Logged in successfully!',
    );
  }

  async refresh({ refreshToken }: RefreshDto): Promise<ResponseFormat> {
    const user = await this.verifyRefreshToken(refreshToken);
    if (!user || !user.deviceId) throw new SessionNotFoundException();

    return this.generateTokensAndUpsertSession(
      user,
      user.deviceId,
      'Tokens refreshed successfully!',
    );
  }

  async logout({ refreshToken }: LogoutDto): Promise<ResponseFormat> {
    const user = await this.verifyRefreshToken(refreshToken);
    if (!user || !user.deviceId) throw new SessionNotFoundException();

    await this.sessionsService.delete(user.id, user.deviceId);
    return new ResponseFormat({
      message: 'Logged out successfully!',
    });
  }
}
