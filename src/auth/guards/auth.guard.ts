import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, IS_SELF_KEY } from '../auth.constant';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtPayloadUser } from '../models/jwt-payload-user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.isGuarded(context, IS_PUBLIC_KEY);
    if (isPublic) return true;

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const jwtPayloadUser: JwtPayloadUser = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_ACCESS_SECRET,
        },
      );

      const isSelf = this.isGuarded(context, IS_SELF_KEY);
      if (
        isSelf &&
        request.params.id &&
        jwtPayloadUser.id !== Number(request.params.id)
      ) {
        throw new UnauthorizedException();
      }

      request.user = {
        ...jwtPayloadUser,
        token,
      };
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isGuarded(context: ExecutionContext, guardKey: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(guardKey, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
