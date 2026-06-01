import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(q: string, req: any): Promise<{
        status: string;
        data: {
            vehicles: {
                id: string;
                plateNumber: string;
                brand: string;
                model: string;
                year: number;
                vehicleType: string;
                status: import("@prisma/client").$Enums.VehicleStatus;
            }[];
            documents: {
                id: string;
                vehicle: {
                    plateNumber: string;
                    brand: string;
                    model: string;
                };
                vehicleId: string;
                documentType: import("@prisma/client").$Enums.DocumentType;
                documentNumber: string;
                expiryDate: Date;
            }[];
            histories: {
                id: string;
                vehicle: {
                    plateNumber: string;
                    brand: string;
                    model: string;
                };
                vehicleId: string;
                title: string;
                maintenanceType: import("@prisma/client").$Enums.MaintenanceType;
                serviceDate: Date;
                workshopName: string;
            }[];
            users: never[] | {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
            }[];
        };
    }>;
}
