import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(3)
  name?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
