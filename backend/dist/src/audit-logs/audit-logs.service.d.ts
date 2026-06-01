import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
export interface CreateAuditLogData {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
    entity: string;
    entityId?: string;
    entityName?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: CreateAuditLogData): Promise<void>;
    findAll(query: QueryAuditLogDto): Promise<{
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
            userId: string;
            entity: string;
            action: string;
            entityId: string | null;
            entityName: string | null;
            oldValues: import("@prisma/client/runtime/client").JsonValue | null;
            newValues: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
