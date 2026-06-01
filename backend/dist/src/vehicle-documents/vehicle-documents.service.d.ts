import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class VehicleDocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private calculateDocumentStatus;
    private attachStatusToDoc;
    create(createDocumentDto: CreateDocumentDto): Promise<{
        status: string;
        message: string;
        data: any;
    }>;
    findAll(vehicleId?: string): Promise<{
        status: string;
        message: string;
        data: any[];
    }>;
    findOne(id: string): Promise<{
        status: string;
        message: string;
        data: any;
    }>;
    update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<{
        status: string;
        message: string;
        data: any;
    }>;
    remove(id: string): Promise<{
        status: string;
        message: string;
    }>;
}
