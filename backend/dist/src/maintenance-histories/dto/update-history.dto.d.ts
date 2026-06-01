import { MaintenanceType } from '@prisma/client';
export declare class UpdateHistoryDto {
    maintenanceType?: MaintenanceType;
    title?: string;
    description?: string;
    serviceDate?: string;
    odometerAtService?: number;
    workshopName?: string;
    cost?: number;
    status?: string;
    notes?: string;
}
