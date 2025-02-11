import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
