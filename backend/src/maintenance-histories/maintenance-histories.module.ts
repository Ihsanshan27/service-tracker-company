import { Module } from '@nestjs/common';
import { MaintenanceHistoriesService } from './maintenance-histories.service';
import { MaintenanceHistoriesController } from './maintenance-histories.controller';

@Module({
  controllers: [MaintenanceHistoriesController],
  providers: [MaintenanceHistoriesService],
  exports: [MaintenanceHistoriesService],
})
export class MaintenanceHistoriesModule {}
