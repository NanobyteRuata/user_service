import { Injectable } from '@nestjs/common';
import { Session } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { toMs } from 'ms-typescript';

@Injectable()
export class SessionsService {
  readonly DEFAULT_REFRESH_EXPIRE_IN = '7d';

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

  async upsert(
    userId: number,
    refreshToken: string,
    deviceId: string,
    expiresAt = this.getNewTokenExpiresAt(),
  ): Promise<Session | null> {
    await this.sessionRepository.upsert(
      { user: { id: userId }, deviceId, refreshToken, expiresAt },
      ['user', 'deviceId'],
    );
    return await this.sessionRepository.findOneBy({
      user: { id: userId },
      deviceId,
    });
  }
}
