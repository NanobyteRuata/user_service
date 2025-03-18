import { Injectable } from '@nestjs/common';
import { Session } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { toMs } from 'ms-typescript';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionsService {
  private readonly DEFAULT_REFRESH_EXPIRE_IN = '7d';

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private configService: ConfigService,
  ) {}

  private getNewTokenExpiresAt(): Date {
    const expireIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRE_IN') ??
      this.DEFAULT_REFRESH_EXPIRE_IN;

    const expireInMs = toMs(expireIn);
    const todayMs = new Date().getTime();
    return new Date(todayMs + expireInMs);
  }

  async findByUserId(id: number): Promise<Session[]> {
    return await this.sessionRepository.findBy({ user: { id } });
  }

  async upsert(
    userId: number,
    refreshToken: string,
    deviceId: string,
    expiresAt = this.getNewTokenExpiresAt(),
  ): Promise<Session | null> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.sessionRepository.upsert(
      {
        user: { id: userId },
        deviceId,
        refreshToken: hashedRefreshToken,
        expiresAt,
      },
      ['user', 'deviceId'],
    );
    return await this.sessionRepository.findOneBy({
      user: { id: userId },
      deviceId,
    });
  }

  async delete(userId: number, deviceId: string): Promise<DeleteResult> {
    return await this.sessionRepository.delete({
      user: { id: userId },
      deviceId,
    });
  }
}
