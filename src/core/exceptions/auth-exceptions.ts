import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongCredentialsException extends HttpException {
  constructor() {
    super('Email or password incorrect', HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedUserException extends HttpException {
  constructor() {
    super('Unauthorized user', HttpStatus.UNAUTHORIZED);
  }
}
