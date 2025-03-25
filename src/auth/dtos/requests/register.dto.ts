import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    name: 'name',
    example: 'John Doe',
    type: String,
    description: 'User display name',
  })
  @Length(3)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'email',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
    uniqueItems: true,
    description: 'User email address',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    example: 'password123',
    type: String,
    description: 'User password',
  })
  @Length(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
