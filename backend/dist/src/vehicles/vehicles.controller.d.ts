import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateOdometerDto } from './dto/update-odometer.dto';
import { VehicleStatus } from '@prisma/client';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            vehicleType: string;
            fuelType: string;
            transmission: string;
            chassisNumber: string;
            engineNumber: string;
            currentOdometer: number;
            status: import("@prisma/client").$Enums.VehicleStatus;
            purchaseDate: Date;
            notes: string | null;
        };
    }>;
    findAll(search?: string, status?: VehicleStatus, vehicleType?: string): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            vehicleType: string;
            fuelType: string;
            transmission: string;
            chassisNumber: string;
            engineNumber: string;
            currentOdometer: number;
            status: import("@prisma/client").$Enums.VehicleStatus;
            purchaseDate: Date;
            notes: string | null;
        }[];
    }>;
    findOne(id: string): Promise<{
        status: string;
        message: string;
        data: {
            odometerLogs: ({
                user: {
                    id: string;
                    name: string;
                    role: import("@prisma/client").$Enums.UserRole;
                };
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                odometer: number;
                date: Date;
                vehicleId: string;
                userId: string;
            })[];
            assignments: ({
                driver: {
                    id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                notes: string | null;
                vehicleId: string;
                driverId: string;
                startDate: Date;
                endDate: Date | null;
            })[];
            maintenanceSchedules: {
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
            }[];
            maintenanceHistories: {
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
            }[];
            documents: {
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
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            vehicleType: string;
            fuelType: string;
            transmission: string;
            chassisNumber: string;
            engineNumber: string;
            currentOdometer: number;
            status: import("@prisma/client").$Enums.VehicleStatus;
            purchaseDate: Date;
            notes: string | null;
        };
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            vehicleType: string;
            fuelType: string;
            transmission: string;
            chassisNumber: string;
            engineNumber: string;
            currentOdometer: number;
            status: import("@prisma/client").$Enums.VehicleStatus;
            purchaseDate: Date;
            notes: string | null;
        };
    }>;
    remove(id: string, req: any): Promise<{
        status: string;
        message: string;
    }>;
    updateOdometer(id: string, updateOdometerDto: UpdateOdometerDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            vehicleType: string;
            fuelType: string;
            transmission: string;
            chassisNumber: string;
            engineNumber: string;
            currentOdometer: number;
            status: import("@prisma/client").$Enums.VehicleStatus;
            purchaseDate: Date;
            notes: string | null;
        };
    }>;
}
