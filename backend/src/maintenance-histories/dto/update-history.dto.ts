import { IsOptional, IsString, IsEnum, IsInt, IsDateString, IsNumber, Min } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class UpdateHistoryDto {
  @IsEnum(MaintenanceType, { message: 'Tipe maintenance tidak valid' })
  @IsOptional()
  maintenanceType?: MaintenanceType;

  @IsString({ message: 'Judul harus berupa string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Deskripsi harus berupa string' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Format tanggal service tidak valid' })
  @IsOptional()
  serviceDate?: string;

  @IsInt({ message: 'Odometer saat service harus berupa integer' })
  @Min(0, { message: 'Odometer tidak valid' })
  @IsOptional()
  odometerAtService?: number;

  @IsString({ message: 'Nama bengkel harus berupa string' })
  @IsOptional()
  workshopName?: string;

  @IsNumber({}, { message: 'Biaya harus berupa angka' })
  @Min(0, { message: 'Biaya tidak valid' })
  @IsOptional()
  cost?: number;

  @IsString({ message: 'Status harus berupa string' })
  @IsOptional()
  status?: string;

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  notes?: string;
}
