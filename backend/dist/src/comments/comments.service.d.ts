import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByVehicle(vehicleId: string): Promise<{
        status: string;
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string;
            userId: string;
            content: string;
        })[];
    }>;
    create(vehicleId: string, userId: string, dto: CreateCommentDto): Promise<{
        status: string;
        message: string;
        data: {
            user: {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string;
            userId: string;
            content: string;
        };
    }>;
    remove(commentId: string, requestUserId: string, requestUserRole: string): Promise<{
        status: string;
        message: string;
    }>;
}
