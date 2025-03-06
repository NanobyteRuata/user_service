import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { Auth } from './auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
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
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
