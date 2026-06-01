"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VehicleDocumentsService = class VehicleDocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateDocumentStatus(expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(expiryDate);
        expDate.setHours(0, 0, 0, 0);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            return 'EXPIRED';
        }
        else if (diffDays <= 30) {
            return 'EXPIRES_SOON';
        }
        else {
            return 'ACTIVE';
        }
    }
    attachStatusToDoc(doc) {
        return {
            ...doc,
            status: this.calculateDocumentStatus(doc.expiryDate),
        };
    }
    async create(createDocumentDto) {
        const { vehicleId, issueDate, expiryDate, ...rest } = createDocumentDto;
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Kendaraan tidak ditemukan.',
            });
        }
        const doc = await this.prisma.vehicleDocument.create({
            data: {
                ...rest,
                vehicleId,
                issueDate: new Date(issueDate),
                expiryDate: new Date(expiryDate),
            },
        });
        return {
            status: 'success',
            message: 'Dokumen kendaraan berhasil ditambahkan',
            data: this.attachStatusToDoc(doc),
        };
    }
    async findAll(vehicleId) {
        const where = {};
        if (vehicleId) {
            where.vehicleId = vehicleId;
        }
        const docs = await this.prisma.vehicleDocument.findMany({
            where,
            include: {
                vehicle: {
                    select: {
                        id: true,
                        plateNumber: true,
                        brand: true,
                        model: true,
                    },
                },
            },
            orderBy: {
                expiryDate: 'asc',
            },
        });
        const mappedDocs = docs.map((doc) => this.attachStatusToDoc(doc));
        return {
            status: 'success',
            message: 'Daftar dokumen kendaraan berhasil diambil',
            data: mappedDocs,
        };
    }
    async findOne(id) {
        const doc = await this.prisma.vehicleDocument.findUnique({
            where: { id },
            include: {
                vehicle: {
                    select: {
                        id: true,
                        plateNumber: true,
                        brand: true,
                        model: true,
                        currentOdometer: true,
                    },
                },
            },
        });
        if (!doc) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Dokumen kendaraan tidak ditemukan.',
            });
        }
        return {
            status: 'success',
            message: 'Detail dokumen kendaraan berhasil diambil',
            data: this.attachStatusToDoc(doc),
        };
    }
    async update(id, updateDocumentDto) {
        await this.findOne(id);
        const data = { ...updateDocumentDto };
        if (updateDocumentDto.issueDate) {
            data.issueDate = new Date(updateDocumentDto.issueDate);
        }
        if (updateDocumentDto.expiryDate) {
            data.expiryDate = new Date(updateDocumentDto.expiryDate);
        }
        const updated = await this.prisma.vehicleDocument.update({
            where: { id },
            data,
        });
        return {
            status: 'success',
            message: 'Dokumen kendaraan berhasil diperbarui',
            data: this.attachStatusToDoc(updated),
        };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.vehicleDocument.delete({
            where: { id },
        });
        return {
            status: 'success',
            message: 'Dokumen kendaraan berhasil dihapus',
        };
    }
};
exports.VehicleDocumentsService = VehicleDocumentsService;
exports.VehicleDocumentsService = VehicleDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehicleDocumentsService);
//# sourceMappingURL=vehicle-documents.service.js.map