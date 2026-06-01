import { VehicleStatus } from '@prisma/client';
export declare class UpdateVehicleDto {
    plateNumber?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    vehicleType?: string;
    fuelType?: string;
    transmission?: string;
    chassisNumber?: string;
    engineNumber?: string;
    status?: VehicleStatus;
    purchaseDate?: string;
    notes?: string;
}
