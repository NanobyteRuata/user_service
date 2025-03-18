import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseFormat } from 'src/common/dto/response-format.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    if (!(exception instanceof HttpException)) {
      console.error(exception);
    }

    let errorMessage: string = 'An error occurred';
    let errorDetails: object | null = null;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      errorMessage =
        ('message' in exceptionResponse &&
          (exceptionResponse.message as string)) ||
        errorMessage;
      errorDetails =
        ('error' in exceptionResponse && (exceptionResponse.error as object)) ||
        ('details' in exceptionResponse &&
          (exceptionResponse.details as object)) ||
        null;

      // for class-validator DTO error messages
      if (Array.isArray(errorMessage) && errorMessage.length) {
        errorMessage = errorMessage[0] as string;
      }
    }

    response.status(status).json(
      new ResponseFormat({
        status: 'error',
        message: errorMessage,
        error: {
          code: status,
          details: errorDetails,
        },
      }),
    );
  }
}
