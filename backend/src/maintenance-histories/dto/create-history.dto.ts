import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, IsDateString, IsNumber, Min } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class CreateHistoryDto {
  @IsString({ message: 'ID Kendaraan harus berupa string' })
  @IsNotEmpty({ message: 'ID Kendaraan tidak boleh kosong' })
  vehicleId: string;

  @IsString({ message: 'ID Jadwal harus berupa string' })
  @IsOptional()
  scheduleId?: string;

  @IsString({ message: 'ID Mekanik harus berupa string' })
  @IsOptional()
  performedBy?: string;

  @IsEnum(MaintenanceType, { message: 'Tipe maintenance tidak valid' })
  @IsNotEmpty({ message: 'Tipe maintenance tidak boleh kosong' })
  maintenanceType: MaintenanceType;

  @IsString({ message: 'Judul tidak boleh kosong' })
  @IsNotEmpty({ message: 'Judul tidak boleh kosong' })
  title: string;

  @IsString({ message: 'Deskripsi harus berupa string' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Format tanggal service tidak valid' })
  @IsNotEmpty({ message: 'Tanggal service tidak boleh kosong' })
  serviceDate: string;

  @IsInt({ message: 'Odometer saat service harus berupa integer' })
  @Min(0, { message: 'Odometer tidak valid' })
  @IsNotEmpty({ message: 'Odometer saat service tidak boleh kosong' })
  odometerAtService: number;

  @IsString({ message: 'Nama bengkel tidak boleh kosong' })
  @IsNotEmpty({ message: 'Nama bengkel tidak boleh kosong' })
  workshopName: string;

  @IsNumber({}, { message: 'Biaya harus berupa angka' })
  @Min(0, { message: 'Biaya tidak valid' })
  @IsNotEmpty({ message: 'Biaya tidak boleh kosong' })
  cost: number;

  @IsString({ message: 'Status harus berupa string' })
  @IsOptional()
  status?: string; // COMPLETED, CANCELLED

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  notes?: string;
}
