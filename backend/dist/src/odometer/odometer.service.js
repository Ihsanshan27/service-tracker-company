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
exports.OdometerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OdometerService = class OdometerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(vehicleId, createOdometerDto, userId) {
        const { odometer, notes } = createOdometerDto;
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Kendaraan tidak ditemukan.',
            });
        }
        if (odometer < vehicle.currentOdometer) {
            throw new common_1.BadRequestException({
                status: 'error',
                message: `Nilai odometer baru (${odometer} km) tidak boleh lebih kecil dari odometer saat ini (${vehicle.currentOdometer} km).`,
            });
        }
        const [_, odometerLog] = await this.prisma.$transaction([
            this.prisma.vehicle.update({
                where: { id: vehicleId },
                data: { currentOdometer: odometer },
            }),
            this.prisma.odometerLog.create({
                data: {
                    vehicleId,
                    userId,
                    odometer,
                    date: new Date(),
                    notes,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            }),
        ]);
        return {
            status: 'success',
            message: 'Log odometer berhasil ditambahkan',
            data: odometerLog,
        };
    }
    async findAll(vehicleId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Kendaraan tidak ditemukan.',
            });
        }
        const logs = await this.prisma.odometerLog.findMany({
            where: { vehicleId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            status: 'success',
            message: 'Riwayat odometer berhasil diambil',
            data: logs,
        };
    }
};
exports.OdometerService = OdometerService;
exports.OdometerService = OdometerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OdometerService);
//# sourceMappingURL=odometer.service.js.map