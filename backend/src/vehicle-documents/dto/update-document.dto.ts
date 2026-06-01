import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UpdateDocumentDto {
  @IsEnum(DocumentType, { message: 'Tipe dokumen tidak valid' })
  @IsOptional()
  documentType?: DocumentType;

  @IsString({ message: 'Nomor dokumen harus berupa string' })
  @IsOptional()
  documentNumber?: string;

  @IsDateString({}, { message: 'Format tanggal terbit tidak valid' })
  @IsOptional()
  issueDate?: string;

  @IsDateString({}, { message: 'Format tanggal expired tidak valid' })
  @IsOptional()
  expiryDate?: string;

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
