import { MaintenanceType } from '@prisma/client';
export declare class CreateHistoryDto {
    vehicleId: string;
    scheduleId?: string;
    performedBy?: string;
    maintenanceType: MaintenanceType;
    title: string;
    description?: string;
    serviceDate: string;
    odometerAtService: number;
    workshopName: string;
    cost: number;
    status?: string;
    notes?: string;
}
