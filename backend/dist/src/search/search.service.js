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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query, userRole) {
        if (!query || query.trim().length < 2) {
            return {
                status: 'success',
                data: { vehicles: [], documents: [], histories: [], users: [] },
            };
        }
        const q = query.trim();
        const [vehicles, documents, histories, users] = await Promise.all([
            this.prisma.vehicle.findMany({
                where: {
                    OR: [
                        { plateNumber: { contains: q, mode: 'insensitive' } },
                        { brand: { contains: q, mode: 'insensitive' } },
                        { model: { contains: q, mode: 'insensitive' } },
                        { color: { contains: q, mode: 'insensitive' } },
                        { vehicleType: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                select: {
                    id: true,
                    plateNumber: true,
                    brand: true,
                    model: true,
                    year: true,
                    status: true,
                    vehicleType: true,
                },
            }),
            this.prisma.vehicleDocument.findMany({
                where: {
                    OR: [
                        { documentNumber: { contains: q, mode: 'insensitive' } },
                        { provider: { contains: q, mode: 'insensitive' } },
                        { notes: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                select: {
                    id: true,
                    documentType: true,
                    documentNumber: true,
                    expiryDate: true,
                    vehicleId: true,
                    vehicle: {
                        select: { plateNumber: true, brand: true, model: true },
                    },
                },
            }),
            this.prisma.maintenanceHistory.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { workshopName: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    maintenanceType: true,
                    serviceDate: true,
                    workshopName: true,
                    vehicleId: true,
                    vehicle: {
                        select: { plateNumber: true, brand: true, model: true },
                    },
                },
            }),
            ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(userRole)
                ? this.prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } },
                        ],
                    },
                    take: 5,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                })
                : Promise.resolve([]),
        ]);
        return {
            status: 'success',
            data: { vehicles, documents, histories, users },
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map