import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, IsDateString, Min } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class CreateScheduleDto {
  @IsString({ message: 'ID Kendaraan harus berupa string' })
  @IsNotEmpty({ message: 'ID Kendaraan tidak boleh kosong' })
  vehicleId: string;

  @IsString({ message: 'Judul jadwal tidak boleh kosong' })
  @IsNotEmpty({ message: 'Judul jadwal tidak boleh kosong' })
  title: string;

  @IsString({ message: 'Deskripsi harus berupa string' })
  @IsOptional()
  description?: string;

  @IsEnum(MaintenanceType, { message: 'Tipe maintenance tidak valid' })
  @IsNotEmpty({ message: 'Tipe maintenance tidak boleh kosong' })
  maintenanceType: MaintenanceType;

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
}
