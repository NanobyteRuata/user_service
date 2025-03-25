import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from 'src/sessions/sessions.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule, SessionsModule, TypeOrmModule.forFeature([Auth])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [TypeOrmModule],
})
export class AuthModule {}
