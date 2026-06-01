import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsString({ message: 'ID Kendaraan harus berupa string' })
  @IsNotEmpty({ message: 'ID Kendaraan tidak boleh kosong' })
  vehicleId: string;

  @IsEnum(DocumentType, { message: 'Tipe dokumen tidak valid' })
  @IsNotEmpty({ message: 'Tipe dokumen tidak boleh kosong' })
  documentType: DocumentType;

  @IsString({ message: 'Nomor dokumen tidak boleh kosong' })
  @IsNotEmpty({ message: 'Nomor dokumen tidak boleh kosong' })
  documentNumber: string;

  @IsDateString({}, { message: 'Format tanggal terbit tidak valid' })
  @IsNotEmpty({ message: 'Tanggal terbit tidak boleh kosong' })
  issueDate: string;

  @IsDateString({}, { message: 'Format tanggal expired tidak valid' })
  @IsNotEmpty({ message: 'Tanggal expired tidak boleh kosong' })
  expiryDate: string;

  @IsString({ message: 'Provider harus berupa string' })
  @IsOptional()
  provider?: string;

  @IsNumber({}, { message: 'Biaya harus berupa angka' })
  @Min(0, { message: 'Biaya tidak boleh kurang dari 0' })
  @IsOptional()
  cost?: number;

  @IsString({ message: 'URL dokumen harus berupa string' })
  @IsOptional()
  documentUrl?: string;

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  notes?: string;
}
