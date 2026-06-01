import { OdometerService } from './odometer.service';
import { CreateOdometerDto } from './dto/create-odometer.dto';
export declare class OdometerController {
    private readonly odometerService;
    constructor(odometerService: OdometerService);
    create(vehicleId: string, createOdometerDto: CreateOdometerDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
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
        };
    }>;
    findAll(vehicleId: string): Promise<{
        status: string;
        message: string;
        data: ({
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
    }>;
}
