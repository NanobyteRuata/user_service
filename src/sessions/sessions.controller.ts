import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Admin, Self } from 'src/auth/auth.constant';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Admin()
  @Self()
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: number,
  ) {
    if (userId) {
      return this.sessionsService.findByUserId(userId, { page, limit });
    }

    return this.sessionsService.findAll({ page, limit });
  }

  @Admin()
  @Self()
  @Post('end-session')
  endSession(@Body() payload: { userId: number; deviceIds: string[] }) {
    return this.sessionsService.delete(payload.userId, payload.deviceIds);
  }
}
