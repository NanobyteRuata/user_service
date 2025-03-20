import { Injectable } from '@nestjs/common';
import { Session } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { toMs } from 'ms-typescript';
import * as bcrypt from 'bcrypt';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ResponseFormat } from 'src/common/model/response-format.model';

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

  async getSession(userId: number, deviceId: string): Promise<Session | null> {
    return await this.sessionRepository.findOneBy({
      user: { id: userId },
      deviceId,
    });
  }

  async findAll(options: IPaginationOptions): Promise<ResponseFormat> {
    const { items, meta } = await paginate<Session>(
      this.sessionRepository,
      options,
    );

    return new ResponseFormat({
      status: 'success',
      message: 'Sessions fetched successfully',
      data: items,
      pagination: meta,
    });
  }

  async findByUserId(
    id: number,
    options: IPaginationOptions,
  ): Promise<ResponseFormat> {
    const { items, meta } = await paginate<Session>(
      this.sessionRepository,
      options,
      { user: { id } },
    );

    return new ResponseFormat({
      status: 'success',
      message: 'Sessions fetched successfully',
      data: items,
      pagination: meta,
    });
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

  async delete(
    userId: number,
    deviceId: string | string[],
  ): Promise<DeleteResult> {
    if (Array.isArray(deviceId)) {
      return await this.sessionRepository.delete({
        user: { id: userId },
        deviceId: In(deviceId),
      });
    }

    return await this.sessionRepository.delete({
      user: { id: userId },
      deviceId,
    });
  }
}
