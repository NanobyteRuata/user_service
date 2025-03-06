import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.constant';
import { RegisterDto } from 'src/auth/dtos/register.dto';
import { LoginDto } from 'src/auth/dtos/login.dto';
import { Request } from 'express';
import { RefreshDto } from 'src/auth/dtos/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: Request, @Body() payload: RefreshDto) {
    if (!req.user) throw new BadRequestException();
    return this.authService.logout(req.user['id'], payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Req() req: Request, @Body() payload: RefreshDto) {
    if (!req.user) throw new BadRequestException();
    return this.authService.refresh(req.user['id'], req.user['email'], payload);
  }
}
