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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let VehiclesService = class VehiclesService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async create(createVehicleDto, userId) {
        const { plateNumber, purchaseDate, ...rest } = createVehicleDto;
        const existingVehicle = await this.prisma.vehicle.findUnique({
            where: { plateNumber },
        });
        if (existingVehicle) {
            throw new common_1.ConflictException({
                status: 'error',
                message: `Kendaraan dengan nomor polisi ${plateNumber} sudah terdaftar.`,
            });
        }
        const vehicle = await this.prisma.vehicle.create({
            data: {
                ...rest,
                plateNumber: plateNumber.toUpperCase(),
                purchaseDate: new Date(purchaseDate),
            },
        });
        if (userId) {
            await this.auditLogs.log({
                userId,
                action: 'CREATE',
                entity: 'Vehicle',
                entityId: vehicle.id,
                entityName: `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`,
                newValues: { plateNumber: vehicle.plateNumber, brand: vehicle.brand, model: vehicle.model, status: vehicle.status },
            });
        }
        return {
            status: 'success',
            message: 'Kendaraan berhasil ditambahkan',
            data: vehicle,
        };
    }
    async findAll(search, status, vehicleType) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (vehicleType) {
            where.vehicleType = vehicleType;
        }
        if (search) {
            where.OR = [
                { plateNumber: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
            ];
        }
        const vehicles = await this.prisma.vehicle.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            status: 'success',
            message: 'Daftar kendaraan berhasil diambil',
            data: vehicles,
        };
    }
    async findOne(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                odometerLogs: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                assignments: {
                    where: { status: 'ACTIVE' },
                    include: {
                        driver: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                maintenanceSchedules: {
                    orderBy: { nextServiceDate: 'asc' },
                },
                maintenanceHistories: {
                    orderBy: { serviceDate: 'desc' },
                },
                documents: {
                    orderBy: { expiryDate: 'asc' },
                },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Kendaraan tidak ditemukan.',
            });
        }
        return {
            status: 'success',
            message: 'Detail kendaraan berhasil diambil',
            data: vehicle,
        };
    }
    async update(id, updateVehicleDto, userId) {
        const existing = await this.findOne(id);
        const data = { ...updateVehicleDto };
        if (updateVehicleDto.plateNumber) {
            data.plateNumber = updateVehicleDto.plateNumber.toUpperCase();
            const existingVehicle = await this.prisma.vehicle.findUnique({
                where: { plateNumber: data.plateNumber },
            });
            if (existingVehicle && existingVehicle.id !== id) {
                throw new common_1.ConflictException({
                    status: 'error',
                    message: `Nomor polisi ${data.plateNumber} sudah digunakan oleh kendaraan lain.`,
                });
            }
        }
        if (updateVehicleDto.purchaseDate) {
            data.purchaseDate = new Date(updateVehicleDto.purchaseDate);
        }
        const updatedVehicle = await this.prisma.vehicle.update({
            where: { id },
            data,
        });
        if (userId) {
            await this.auditLogs.log({
                userId,
                action: 'UPDATE',
                entity: 'Vehicle',
                entityId: id,
                entityName: `${updatedVehicle.brand} ${updatedVehicle.model} (${updatedVehicle.plateNumber})`,
                oldValues: existing.data,
                newValues: updateVehicleDto,
            });
        }
        return {
            status: 'success',
            message: 'Kendaraan berhasil diperbarui',
            data: updatedVehicle,
        };
    }
    async remove(id, userId) {
        const existing = await this.findOne(id);
        const vehicle = existing.data;
        await this.prisma.vehicle.delete({
            where: { id },
        });
        if (userId) {
            await this.auditLogs.log({
                userId,
                action: 'DELETE',
                entity: 'Vehicle',
                entityId: id,
                entityName: `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`,
                oldValues: { plateNumber: vehicle.plateNumber, brand: vehicle.brand, model: vehicle.model },
            });
        }
        return {
            status: 'success',
            message: 'Kendaraan berhasil dihapus',
        };
    }
    async updateOdometer(id, updateOdometerDto, userId) {
        const { odometer, notes } = updateOdometerDto;
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
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
        const [updatedVehicle] = await this.prisma.$transaction([
            this.prisma.vehicle.update({
                where: { id },
                data: { currentOdometer: odometer },
            }),
            this.prisma.odometerLog.create({
                data: {
                    vehicleId: id,
                    userId,
                    odometer,
                    date: new Date(),
                    notes,
                },
            }),
        ]);
        return {
            status: 'success',
            message: 'Odometer kendaraan berhasil diperbarui',
            data: updatedVehicle,
        };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map