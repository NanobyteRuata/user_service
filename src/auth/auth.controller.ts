import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.constant';
import { RegisterDto } from 'src/auth/dtos/requests/register.dto';
import { LoginDto } from 'src/auth/dtos/requests/login.dto';
import { RefreshDto } from 'src/auth/dtos/requests/refresh.dto';
import { LogoutDto } from './dtos/requests/logout.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(201)
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('refresh')
  @HttpCode(200)
  @Public()
  @ApiOperation({ summary: 'Refresh a user token' })
  @ApiResponse({
    status: 200,
    description: 'User token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  refresh(@Body() payload: RefreshDto) {
    return this.authService.refresh(payload);
  }

  @Post('logout')
  @HttpCode(200)
  @Public()
  @ApiBearerAuth('Bearer')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Body() payload: LogoutDto) {
    return this.authService.logout(payload);
  }
}
