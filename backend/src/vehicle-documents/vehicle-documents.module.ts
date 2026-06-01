import { Module } from '@nestjs/common';
import { VehicleDocumentsService } from './vehicle-documents.service';
import { VehicleDocumentsController } from './vehicle-documents.controller';

@Module({
  controllers: [VehicleDocumentsController],
  providers: [VehicleDocumentsService],
  exports: [VehicleDocumentsService],
})
export class VehicleDocumentsModule {}
