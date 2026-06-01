import { MaintenanceType } from '@prisma/client';
export declare class CreateScheduleDto {
    vehicleId: string;
    title: string;
    description?: string;
    maintenanceType: MaintenanceType;
    intervalKm?: number;
    intervalMonth?: number;
    lastServiceDate?: string;
    lastServiceOdometer?: number;
}
