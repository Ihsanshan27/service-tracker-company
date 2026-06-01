import { VehicleDocumentsService } from './vehicle-documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class VehicleDocumentsController {
    private readonly documentsService;
    constructor(documentsService: VehicleDocumentsService);
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
