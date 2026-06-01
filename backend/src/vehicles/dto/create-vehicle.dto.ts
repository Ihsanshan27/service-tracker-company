import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString({ message: 'Nomor polisi harus berupa string' })
  @IsNotEmpty({ message: 'Nomor polisi tidak boleh kosong' })
  plateNumber: string;

  @IsString({ message: 'Merk harus berupa string' })
  @IsNotEmpty({ message: 'Merk tidak boleh kosong' })
  brand: string;

  @IsString({ message: 'Model harus berupa string' })
  @IsNotEmpty({ message: 'Model tidak boleh kosong' })
  model: string;

  @IsInt({ message: 'Tahun harus berupa integer' })
  @Min(1900, { message: 'Tahun tidak valid' })
  @IsNotEmpty({ message: 'Tahun tidak boleh kosong' })
  year: number;

  @IsString({ message: 'Warna harus berupa string' })
  @IsNotEmpty({ message: 'Warna tidak boleh kosong' })
  color: string;

  @IsString({ message: 'Tipe kendaraan harus berupa string' })
  @IsNotEmpty({ message: 'Tipe kendaraan tidak boleh kosong' })
  vehicleType: string;

  @IsString({ message: 'Tipe bahan bakar harus berupa string' })
  @IsNotEmpty({ message: 'Tipe bahan bakar tidak boleh kosong' })
  fuelType: string;

  @IsString({ message: 'Transmisi harus berupa string' })
  @IsNotEmpty({ message: 'Transmisi tidak boleh kosong' })
  transmission: string;

  @IsString({ message: 'Nomor rangka harus berupa string' })
  @IsNotEmpty({ message: 'Nomor rangka tidak boleh kosong' })
  chassisNumber: string;

  @IsString({ message: 'Nomor mesin harus berupa string' })
  @IsNotEmpty({ message: 'Nomor mesin tidak boleh kosong' })
  engineNumber: string;

  @IsInt({ message: 'Odometer harus berupa integer' })
  @Min(0, { message: 'Odometer tidak boleh kurang dari 0' })
  @IsNotEmpty({ message: 'Odometer tidak boleh kosong' })
  currentOdometer: number;

  @IsEnum(VehicleStatus, { message: 'Status tidak valid' })
  @IsOptional()
  status?: VehicleStatus;

  @IsDateString({}, { message: 'Format tanggal pembelian tidak valid' })
  @IsNotEmpty({ message: 'Tanggal pembelian tidak boleh kosong' })
  purchaseDate: string;

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  notes?: string;
}
