import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { MaintenanceStatus } from '@prisma/client';
export declare class MaintenanceSchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    private resolveScheduleStatus;
    private calculateNextValues;
    create(createScheduleDto: CreateScheduleDto): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.MaintenanceStatus;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            intervalKm: number | null;
            intervalMonth: number | null;
            lastServiceDate: Date | null;
            lastServiceOdometer: number | null;
            nextServiceDate: Date | null;
            nextServiceOdometer: number | null;
        };
    }>;
    findAll(status?: MaintenanceStatus, vehicleId?: string): Promise<{
        status: string;
        message: string;
        data: ({
            vehicle: {
                id: string;
                plateNumber: string;
                brand: string;
                model: string;
                currentOdometer: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.MaintenanceStatus;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            intervalKm: number | null;
            intervalMonth: number | null;
            lastServiceDate: Date | null;
            lastServiceOdometer: number | null;
            nextServiceDate: Date | null;
            nextServiceOdometer: number | null;
        })[];
    }>;
    findOne(id: string): Promise<{
        status: string;
        message: string;
        data: {
            vehicle: {
                id: string;
                plateNumber: string;
                brand: string;
                model: string;
                currentOdometer: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.MaintenanceStatus;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            intervalKm: number | null;
            intervalMonth: number | null;
            lastServiceDate: Date | null;
            lastServiceOdometer: number | null;
            nextServiceDate: Date | null;
            nextServiceOdometer: number | null;
        };
    }>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.MaintenanceStatus;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            intervalKm: number | null;
            intervalMonth: number | null;
            lastServiceDate: Date | null;
            lastServiceOdometer: number | null;
            nextServiceDate: Date | null;
            nextServiceOdometer: number | null;
        };
    }>;
    remove(id: string): Promise<{
        status: string;
        message: string;
    }>;
}
