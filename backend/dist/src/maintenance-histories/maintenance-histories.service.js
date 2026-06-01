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
exports.MaintenanceHistoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MaintenanceHistoriesService = class MaintenanceHistoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createHistoryDto, creatorId) {
        const { vehicleId, scheduleId, performedBy, serviceDate, odometerAtService, ...rest } = createHistoryDto;
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Kendaraan tidak ditemukan.',
            });
        }
        const sDate = new Date(serviceDate);
        const result = await this.prisma.$transaction(async (tx) => {
            if (odometerAtService > vehicle.currentOdometer) {
                await tx.vehicle.update({
                    where: { id: vehicleId },
                    data: { currentOdometer: odometerAtService },
                });
                await tx.odometerLog.create({
                    data: {
                        vehicleId,
                        userId: performedBy || creatorId,
                        odometer: odometerAtService,
                        date: sDate,
                        notes: `Odometer terupdate otomatis dari pengerjaan service: ${rest.title}`,
                    },
                });
            }
            if (scheduleId) {
                const schedule = await tx.maintenanceSchedule.findUnique({
                    where: { id: scheduleId },
                });
                if (!schedule) {
                    throw new common_1.NotFoundException({
                        status: 'error',
                        message: 'Jadwal maintenance terkait tidak ditemukan.',
                    });
                }
                await tx.maintenanceSchedule.update({
                    where: { id: scheduleId },
                    data: {
                        status: client_1.MaintenanceStatus.COMPLETED,
                        lastServiceDate: sDate,
                        lastServiceOdometer: odometerAtService,
                    },
                });
                if (schedule.intervalKm || schedule.intervalMonth) {
                    let nextDate = null;
                    let nextOdo = null;
                    if (schedule.intervalMonth) {
                        const tempDate = new Date(sDate);
                        tempDate.setMonth(tempDate.getMonth() + schedule.intervalMonth);
                        nextDate = tempDate;
                    }
                    if (schedule.intervalKm) {
                        nextOdo = odometerAtService + schedule.intervalKm;
                    }
                    let resolvedStatus = client_1.MaintenanceStatus.UPCOMING;
                    const currentOdo = Math.max(vehicle.currentOdometer, odometerAtService);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (nextDate) {
                        const nextDateCopy = new Date(nextDate);
                        nextDateCopy.setHours(0, 0, 0, 0);
                        const diffTime = nextDateCopy.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays < 0)
                            resolvedStatus = client_1.MaintenanceStatus.OVERDUE;
                        else if (diffDays <= 7)
                            resolvedStatus = client_1.MaintenanceStatus.DUE_SOON;
                    }
                    if (nextOdo && resolvedStatus !== client_1.MaintenanceStatus.OVERDUE) {
                        const diffKm = nextOdo - currentOdo;
                        if (currentOdo > nextOdo)
                            resolvedStatus = client_1.MaintenanceStatus.OVERDUE;
                        else if (diffKm <= 500)
                            resolvedStatus = client_1.MaintenanceStatus.DUE_SOON;
                    }
                    await tx.maintenanceSchedule.create({
                        data: {
                            vehicleId,
                            title: `${schedule.title} (Berikutnya)`,
                            description: schedule.description,
                            maintenanceType: schedule.maintenanceType,
                            intervalKm: schedule.intervalKm,
                            intervalMonth: schedule.intervalMonth,
                            lastServiceDate: sDate,
                            lastServiceOdometer: odometerAtService,
                            nextServiceDate: nextDate,
                            nextServiceOdometer: nextOdo,
                            status: resolvedStatus,
                        },
                    });
                }
            }
            const history = await tx.maintenanceHistory.create({
                data: {
                    ...rest,
                    vehicleId,
                    scheduleId,
                    performedBy,
                    serviceDate: sDate,
                    odometerAtService,
                },
                include: {
                    mechanic: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            });
            return history;
        });
        return {
            status: 'success',
            message: 'Riwayat maintenance berhasil ditambahkan',
            data: result,
        };
    }
    async findAll(vehicleId, maintenanceType) {
        const where = {};
        if (vehicleId)
            where.vehicleId = vehicleId;
        if (maintenanceType)
            where.maintenanceType = maintenanceType;
        const histories = await this.prisma.maintenanceHistory.findMany({
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
                mechanic: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                serviceDate: 'desc',
            },
        });
        return {
            status: 'success',
            message: 'Daftar riwayat maintenance berhasil diambil',
            data: histories,
        };
    }
    async findOne(id) {
        const history = await this.prisma.maintenanceHistory.findUnique({
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
                mechanic: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                schedule: true,
            },
        });
        if (!history) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Riwayat maintenance tidak ditemukan.',
            });
        }
        return {
            status: 'success',
            message: 'Detail riwayat maintenance berhasil diambil',
            data: history,
        };
    }
    async update(id, updateHistoryDto) {
        await this.findOne(id);
        const data = { ...updateHistoryDto };
        if (updateHistoryDto.serviceDate) {
            data.serviceDate = new Date(updateHistoryDto.serviceDate);
        }
        const updated = await this.prisma.maintenanceHistory.update({
            where: { id },
            data,
        });
        return {
            status: 'success',
            message: 'Riwayat maintenance berhasil diperbarui',
            data: updated,
        };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.maintenanceHistory.delete({
            where: { id },
        });
        return {
            status: 'success',
            message: 'Riwayat maintenance berhasil dihapus',
        };
    }
};
exports.MaintenanceHistoriesService = MaintenanceHistoriesService;
exports.MaintenanceHistoriesService = MaintenanceHistoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceHistoriesService);
//# sourceMappingURL=maintenance-histories.service.js.map