import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    findAll(vehicleId: string): Promise<{
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
    create(vehicleId: string, dto: CreateCommentDto, req: any): Promise<{
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
    remove(commentId: string, req: any): Promise<{
        status: string;
        message: string;
    }>;
}
