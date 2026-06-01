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
exports.MaintenanceSchedulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MaintenanceSchedulesService = class MaintenanceSchedulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveScheduleStatus(schedule, currentOdometer) {
        if (schedule.status === client_1.MaintenanceStatus.COMPLETED) {
            return client_1.MaintenanceStatus.COMPLETED;
        }
        let resolvedStatus = client_1.MaintenanceStatus.UPCOMING;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (schedule.nextServiceDate) {
            const nextDate = new Date(schedule.nextServiceDate);
            nextDate.setHours(0, 0, 0, 0);
            const diffTime = nextDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                resolvedStatus = client_1.MaintenanceStatus.OVERDUE;
            }
            else if (diffDays <= 7) {
                resolvedStatus = client_1.MaintenanceStatus.DUE_SOON;
            }
        }
        if (schedule.nextServiceOdometer) {
            const diffKm = schedule.nextServiceOdometer - currentOdometer;
            if (currentOdometer > schedule.nextServiceOdometer) {
                resolvedStatus = client_1.MaintenanceStatus.OVERDUE;
            }
            else if (diffKm <= 500) {
                if (resolvedStatus !== client_1.MaintenanceStatus.OVERDUE) {
                    resolvedStatus = client_1.MaintenanceStatus.DUE_SOON;
                }
            }
        }
        return resolvedStatus;
    }
    calculateNextValues(data) {
        let nextServiceDate = null;
        let nextServiceOdometer = null;
        if (data.lastServiceDate && data.intervalMonth) {
            const date = new Date(data.lastServiceDate);
            date.setMonth(date.getMonth() + data.intervalMonth);
            nextServiceDate = date;
        }
        if (data.lastServiceOdometer !== undefined && data.intervalKm) {
            nextServiceOdometer = Number(data.lastServiceOdometer) + Number(data.intervalKm);
        }
        return { nextServiceDate, nextServiceOdometer };
    }
    async create(createScheduleDto) {
        const { vehicleId, lastServiceDate, lastServiceOdometer, ...rest } = createScheduleDto;
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Kendaraan tidak ditemukan.',
            });
        }
        const lastDate = lastServiceDate ? new Date(lastServiceDate) : new Date();
        const lastOdo = lastServiceOdometer !== undefined ? lastServiceOdometer : vehicle.currentOdometer;
        const { nextServiceDate, nextServiceOdometer } = this.calculateNextValues({
            intervalKm: rest.intervalKm,
            intervalMonth: rest.intervalMonth,
            lastServiceDate: lastDate,
            lastServiceOdometer: lastOdo,
        });
        const tempSchedule = {
            status: client_1.MaintenanceStatus.UPCOMING,
            nextServiceDate,
            nextServiceOdometer,
        };
        const initialStatus = this.resolveScheduleStatus(tempSchedule, vehicle.currentOdometer);
        const schedule = await this.prisma.maintenanceSchedule.create({
            data: {
                ...rest,
                vehicleId,
                lastServiceDate: lastDate,
                lastServiceOdometer: lastOdo,
                nextServiceDate,
                nextServiceOdometer,
                status: initialStatus,
            },
        });
        return {
            status: 'success',
            message: 'Jadwal maintenance berhasil dibuat',
            data: schedule,
        };
    }
    async findAll(status, vehicleId) {
        const where = {};
        if (status)
            where.status = status;
        if (vehicleId)
            where.vehicleId = vehicleId;
        const schedules = await this.prisma.maintenanceSchedule.findMany({
            where,
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
            orderBy: {
                nextServiceDate: 'asc',
            },
        });
        const updatedSchedules = await Promise.all(schedules.map(async (schedule) => {
            const resolved = this.resolveScheduleStatus(schedule, schedule.vehicle.currentOdometer);
            if (resolved !== schedule.status) {
                return this.prisma.maintenanceSchedule.update({
                    where: { id: schedule.id },
                    data: { status: resolved },
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
            }
            return schedule;
        }));
        return {
            status: 'success',
            message: 'Daftar jadwal maintenance berhasil diambil',
            data: updatedSchedules,
        };
    }
    async findOne(id) {
        const schedule = await this.prisma.maintenanceSchedule.findUnique({
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
        if (!schedule) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Jadwal maintenance tidak ditemukan.',
            });
        }
        const resolved = this.resolveScheduleStatus(schedule, schedule.vehicle.currentOdometer);
        if (resolved !== schedule.status) {
            const updated = await this.prisma.maintenanceSchedule.update({
                where: { id },
                data: { status: resolved },
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
            return {
                status: 'success',
                message: 'Detail jadwal maintenance berhasil diambil',
                data: updated,
            };
        }
        return {
            status: 'success',
            message: 'Detail jadwal maintenance berhasil diambil',
            data: schedule,
        };
    }
    async update(id, updateScheduleDto) {
        const existingScheduleResult = await this.findOne(id);
        const existingSchedule = existingScheduleResult.data;
        const vehicle = existingSchedule.vehicle;
        const data = { ...updateScheduleDto };
        if (updateScheduleDto.lastServiceDate) {
            data.lastServiceDate = new Date(updateScheduleDto.lastServiceDate);
        }
        if (updateScheduleDto.lastServiceDate ||
            updateScheduleDto.lastServiceOdometer !== undefined ||
            updateScheduleDto.intervalKm ||
            updateScheduleDto.intervalMonth) {
            const lastDate = data.lastServiceDate || existingSchedule.lastServiceDate || new Date();
            const lastOdo = data.lastServiceOdometer !== undefined ? data.lastServiceOdometer : (existingSchedule.lastServiceOdometer || vehicle.currentOdometer);
            const intKm = data.intervalKm || existingSchedule.intervalKm;
            const intMonth = data.intervalMonth || existingSchedule.intervalMonth;
            const { nextServiceDate, nextServiceOdometer } = this.calculateNextValues({
                intervalKm: intKm,
                intervalMonth: intMonth,
                lastServiceDate: lastDate,
                lastServiceOdometer: lastOdo,
            });
            data.nextServiceDate = nextServiceDate;
            data.nextServiceOdometer = nextServiceOdometer;
        }
        const tempScheduleForStatus = {
            status: updateScheduleDto.status || existingSchedule.status,
            nextServiceDate: data.nextServiceDate !== undefined ? data.nextServiceDate : existingSchedule.nextServiceDate,
            nextServiceOdometer: data.nextServiceOdometer !== undefined ? data.nextServiceOdometer : existingSchedule.nextServiceOdometer,
        };
        data.status = this.resolveScheduleStatus(tempScheduleForStatus, vehicle.currentOdometer);
        const updated = await this.prisma.maintenanceSchedule.update({
            where: { id },
            data,
        });
        return {
            status: 'success',
            message: 'Jadwal maintenance berhasil diperbarui',
            data: updated,
        };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.maintenanceSchedule.delete({
            where: { id },
        });
        return {
            status: 'success',
            message: 'Jadwal maintenance berhasil dihapus',
        };
    }
};
exports.MaintenanceSchedulesService = MaintenanceSchedulesService;
exports.MaintenanceSchedulesService = MaintenanceSchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceSchedulesService);
//# sourceMappingURL=maintenance-schedules.service.js.map