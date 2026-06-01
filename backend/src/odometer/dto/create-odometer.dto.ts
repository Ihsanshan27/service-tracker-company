import { IsNotEmpty, IsInt, Min, IsString, IsOptional } from 'class-validator';

export class CreateOdometerDto {
  @IsInt({ message: 'Odometer harus berupa integer' })
  @Min(0, { message: 'Odometer tidak boleh kurang dari 0' })
  @IsNotEmpty({ message: 'Odometer tidak boleh kosong' })
  odometer: number;

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  notes?: string;
}
