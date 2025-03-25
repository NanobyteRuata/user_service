import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { SnakeToCamelMiddleware } from './middlewares/snake-to-camel.middleware';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class CoreModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SnakeToCamelMiddleware).forRoutes('*');
  }
}
