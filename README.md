# User Service
### Tools used
- NestJS Framework
	1. @nestjs/schedule for running CRON jobs to cleanup expired refreshTokens
	2. NestInterceptor for standard success response format
	3. Custom Exceptions and ExceptionFilter for standard error response format
- Database
	1. TypeORM (PostgreSQL)
- Authentication
	1. JWT
	2. BCrypt
- Third-Party
	1. nestjs-typeorm-paginate for pagination
	2. Swagger for API documentation
