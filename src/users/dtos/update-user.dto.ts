import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @Length(3)
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
