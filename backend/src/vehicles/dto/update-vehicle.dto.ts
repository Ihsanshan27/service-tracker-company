import { IsEnum, IsOptional, IsString, IsInt, IsDateString, Min } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class UpdateVehicleDto {
  @IsString({ message: 'Nomor polisi harus berupa string' })
  @IsOptional()
  plateNumber?: string;

  @IsString({ message: 'Merk harus berupa string' })
  @IsOptional()
  brand?: string;

  @IsString({ message: 'Model harus berupa string' })
  @IsOptional()
  model?: string;

  @IsInt({ message: 'Tahun harus berupa integer' })
  @Min(1900, { message: 'Tahun tidak valid' })
  @IsOptional()
  year?: number;

  @IsString({ message: 'Warna harus berupa string' })
  @IsOptional()
  color?: string;

  @IsString({ message: 'Tipe kendaraan harus berupa string' })
  @IsOptional()
  vehicleType?: string;

  @IsString({ message: 'Tipe bahan bakar harus berupa string' })
  @IsOptional()
  fuelType?: string;

  @IsString({ message: 'Transmisi harus berupa string' })
  @IsOptional()
  transmission?: string;

  @IsString({ message: 'Nomor rangka harus berupa string' })
  @IsOptional()
  chassisNumber?: string;

  @IsString({ message: 'Nomor mesin harus berupa string' })
  @IsOptional()
  engineNumber?: string;

  @IsEnum(VehicleStatus, { message: 'Status tidak valid' })
  @IsOptional()
  status?: VehicleStatus;

  @IsDateString({}, { message: 'Format tanggal pembelian tidak valid' })
  @IsOptional()
  purchaseDate?: string;

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  notes?: string;
}
