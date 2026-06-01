import { MaintenanceType, MaintenanceStatus } from '@prisma/client';
export declare class UpdateScheduleDto {
    title?: string;
    description?: string;
    maintenanceType?: MaintenanceType;
    intervalKm?: number;
    intervalMonth?: number;
    lastServiceDate?: string;
    lastServiceOdometer?: number;
    status?: MaintenanceStatus;
}
