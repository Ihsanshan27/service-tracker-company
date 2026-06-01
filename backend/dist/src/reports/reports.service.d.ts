import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        status: string;
        message: string;
        data: {
            summary: {
                totalVehicles: number;
                activeVehicles: number;
                inactiveVehicles: number;
                maintenanceVehicles: number;
                dueSchedulesCount: number;
                totalExpiredDocsCount: number;
                totalExpensesThisMonth: number;
            };
            top5Vehicles: {
                vehicleId: string;
                plateNumber: string;
                brand: string;
                model: string;
                totalCost: number;
            }[];
            latestMaintenances: ({
                vehicle: {
                    plateNumber: string;
                    brand: string;
                    model: string;
                };
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
            reminders: {
                schedules: ({
                    vehicle: {
                        plateNumber: string;
                        brand: string;
                        model: string;
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
                documents: {
                    status: string;
                    vehicle: {
                        plateNumber: string;
                        brand: string;
                        model: string;
                    };
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    vehicleId: string;
                    documentType: import("@prisma/client").$Enums.DocumentType;
                    documentNumber: string;
                    issueDate: Date;
                    expiryDate: Date;
                    provider: string | null;
                    cost: number | null;
                    documentUrl: string | null;
                }[];
            };
        };
    }>;
}
