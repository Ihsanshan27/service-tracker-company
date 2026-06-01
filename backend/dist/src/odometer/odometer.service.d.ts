import { PrismaService } from '../prisma/prisma.service';
import { CreateOdometerDto } from './dto/create-odometer.dto';
export declare class OdometerService {
    private prisma;
    constructor(prisma: PrismaService);
    create(vehicleId: string, createOdometerDto: CreateOdometerDto, userId: string): Promise<{
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
