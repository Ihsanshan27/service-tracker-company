import { VehicleStatus } from '@prisma/client';
export declare class CreateVehicleDto {
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
    status?: VehicleStatus;
    purchaseDate: string;
    notes?: string;
}
