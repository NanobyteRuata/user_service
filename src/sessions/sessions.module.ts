import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Session } from './session.entity';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Session])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService, TypeOrmModule],
})
export class SessionsModule {}
