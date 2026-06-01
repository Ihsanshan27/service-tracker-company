import { DocumentType } from '@prisma/client';
export declare class UpdateDocumentDto {
    documentType?: DocumentType;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    provider?: string;
    cost?: number;
    documentUrl?: string;
    notes?: string;
}
