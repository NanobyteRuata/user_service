# Rexpense Server
### Tools used
- NestJS Framework
	1. @nestjs/schedule for running CRON jobs to cleanup expired refreshTokens
	2. NestInterceptor for standard success response format
	3. ExceptionFilter for standard error response format
- Database
	1. TypeORM (PostgreSQL)
- Authentication
	1. PassportJS
	2. JWT
	3. BCrypt