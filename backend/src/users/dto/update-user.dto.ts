import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsString({ message: 'Nama harus berupa string' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Password harus berupa string' })
  @IsOptional()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;

  @IsEnum(UserRole, { message: 'Role tidak valid' })
  @IsOptional()
  role?: UserRole;

  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsOptional()
  phone?: string;

  @IsBoolean({ message: 'Status aktif harus berupa boolean' })
  @IsOptional()
  isActive?: boolean;
}
