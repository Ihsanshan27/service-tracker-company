import { IsOptional, IsString, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { MaintenanceType, MaintenanceStatus } from '@prisma/client';

export class UpdateScheduleDto {
  @IsString({ message: 'Judul jadwal harus berupa string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Deskripsi harus berupa string' })
  @IsOptional()
  description?: string;

  @IsEnum(MaintenanceType, { message: 'Tipe maintenance tidak valid' })
  @IsOptional()
  maintenanceType?: MaintenanceType;

  @IsInt({ message: 'Interval kilometer harus berupa integer' })
  @Min(1, { message: 'Interval kilometer tidak valid' })
  @IsOptional()
  intervalKm?: number;

  @IsInt({ message: 'Interval bulan harus berupa integer' })
  @Min(1, { message: 'Interval bulan tidak valid' })
  @IsOptional()
  intervalMonth?: number;

  @IsDateString({}, { message: 'Format tanggal service terakhir tidak valid' })
  @IsOptional()
  lastServiceDate?: string;

  @IsInt({ message: 'Odometer service terakhir harus berupa integer' })
  @Min(0, { message: 'Odometer service terakhir tidak valid' })
  @IsOptional()
  lastServiceOdometer?: number;

  @IsEnum(MaintenanceStatus, { message: 'Status tidak valid' })
  @IsOptional()
  status?: MaintenanceStatus;
}
