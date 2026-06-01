import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
export declare class MaintenanceHistoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createHistoryDto: CreateHistoryDto, creatorId: string): Promise<{
        status: string;
        message: string;
        data: {
            mechanic: {
                id: string;
                name: string;
                phone: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            cost: number;
            serviceDate: Date;
            odometerAtService: number;
            workshopName: string;
            scheduleId: string | null;
            performedBy: string | null;
        };
    }>;
    findAll(vehicleId?: string, maintenanceType?: string): Promise<{
        status: string;
        message: string;
        data: ({
            vehicle: {
                id: string;
                plateNumber: string;
                brand: string;
                model: string;
            };
            mechanic: {
                id: string;
                name: string;
                phone: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            cost: number;
            serviceDate: Date;
            odometerAtService: number;
            workshopName: string;
            scheduleId: string | null;
            performedBy: string | null;
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
            schedule: {
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
            } | null;
            mechanic: {
                id: string;
                name: string;
                phone: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            cost: number;
            serviceDate: Date;
            odometerAtService: number;
            workshopName: string;
            scheduleId: string | null;
            performedBy: string | null;
        };
    }>;
    update(id: string, updateHistoryDto: UpdateHistoryDto): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            notes: string | null;
            vehicleId: string;
            title: string;
            description: string | null;
            maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
            cost: number;
            serviceDate: Date;
            odometerAtService: number;
            workshopName: string;
            scheduleId: string | null;
            performedBy: string | null;
        };
    }>;
    remove(id: string): Promise<{
        status: string;
        message: string;
    }>;
}
