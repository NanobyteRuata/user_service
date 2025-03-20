import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { Auth } from './auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SessionsModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Auth]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
