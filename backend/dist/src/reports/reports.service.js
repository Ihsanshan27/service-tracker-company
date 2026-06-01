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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const today = new Date();
        const totalVehicles = await this.prisma.vehicle.count();
        const activeVehicles = await this.prisma.vehicle.count({ where: { status: client_1.VehicleStatus.ACTIVE } });
        const inactiveVehicles = await this.prisma.vehicle.count({ where: { status: client_1.VehicleStatus.INACTIVE } });
        const maintenanceVehicles = await this.prisma.vehicle.count({ where: { status: client_1.VehicleStatus.MAINTENANCE } });
        const dueSchedulesCount = await this.prisma.maintenanceSchedule.count({
            where: {
                status: { in: [client_1.MaintenanceStatus.DUE_SOON, client_1.MaintenanceStatus.OVERDUE] },
            },
        });
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        const expiredDocumentsCount = await this.prisma.vehicleDocument.count({
            where: {
                expiryDate: { lte: today },
            },
        });
        const expiresSoonDocumentsCount = await this.prisma.vehicleDocument.count({
            where: {
                expiryDate: {
                    gt: today,
                    lte: thirtyDaysFromNow,
                },
            },
        });
        const totalExpiredDocsCount = expiredDocumentsCount + expiresSoonDocumentsCount;
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        const expenseSum = await this.prisma.vehicleExpense.aggregate({
            where: {
                expenseDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const maintenanceCostSum = await this.prisma.maintenanceHistory.aggregate({
            where: {
                serviceDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
                status: 'COMPLETED',
            },
            _sum: {
                cost: true,
            },
        });
        const totalExpensesThisMonth = (expenseSum._sum.amount || 0) + (maintenanceCostSum._sum.cost || 0);
        const topVehiclesAgg = await this.prisma.maintenanceHistory.groupBy({
            by: ['vehicleId'],
            where: { status: 'COMPLETED' },
            _sum: {
                cost: true,
            },
            orderBy: {
                _sum: {
                    cost: 'desc',
                },
            },
            take: 5,
        });
        const top5Vehicles = await Promise.all(topVehiclesAgg.map(async (item) => {
            const vehicle = await this.prisma.vehicle.findUnique({
                where: { id: item.vehicleId },
                select: { plateNumber: true, brand: true, model: true },
            });
            return {
                vehicleId: item.vehicleId,
                plateNumber: vehicle?.plateNumber || '',
                brand: vehicle?.brand || '',
                model: vehicle?.model || '',
                totalCost: item._sum.cost || 0,
            };
        }));
        const latestMaintenances = await this.prisma.maintenanceHistory.findMany({
            include: {
                vehicle: {
                    select: { plateNumber: true, brand: true, model: true },
                },
            },
            orderBy: {
                serviceDate: 'desc',
            },
            take: 5,
        });
        const schedulesReminder = await this.prisma.maintenanceSchedule.findMany({
            where: {
                status: { in: [client_1.MaintenanceStatus.DUE_SOON, client_1.MaintenanceStatus.OVERDUE] },
            },
            include: {
                vehicle: {
                    select: { plateNumber: true, brand: true, model: true },
                },
            },
            orderBy: {
                nextServiceDate: 'asc',
            },
            take: 5,
        });
        const docs = await this.prisma.vehicleDocument.findMany({
            include: {
                vehicle: {
                    select: { plateNumber: true, brand: true, model: true },
                },
            },
            orderBy: {
                expiryDate: 'asc',
            },
        });
        const calculateDocStatus = (expiryDate) => {
            const diff = new Date(expiryDate).getTime() - today.getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            if (days < 0)
                return 'EXPIRED';
            if (days <= 30)
                return 'EXPIRES_SOON';
            return 'ACTIVE';
        };
        const docReminders = docs
            .map((doc) => ({
            ...doc,
            status: calculateDocStatus(doc.expiryDate),
        }))
            .filter((doc) => doc.status !== 'ACTIVE')
            .slice(0, 5);
        return {
            status: 'success',
            message: 'Analitik dashboard berhasil diambil',
            data: {
                summary: {
                    totalVehicles,
                    activeVehicles,
                    inactiveVehicles,
                    maintenanceVehicles,
                    dueSchedulesCount,
                    totalExpiredDocsCount,
                    totalExpensesThisMonth,
                },
                top5Vehicles,
                latestMaintenances,
                reminders: {
                    schedules: schedulesReminder,
                    documents: docReminders,
                },
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map