import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSetting(key: string): Promise<string>;
    setSetting(key: string, value: string): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            key: string;
            value: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getAllSettings(): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            key: string;
            value: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
}
