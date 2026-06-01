import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleStatus, MaintenanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();

    // 1. Get total vehicles and counts by status
    const totalVehicles = await this.prisma.vehicle.count();
    const activeVehicles = await this.prisma.vehicle.count({ where: { status: VehicleStatus.ACTIVE } });
    const inactiveVehicles = await this.prisma.vehicle.count({ where: { status: VehicleStatus.INACTIVE } });
    const maintenanceVehicles = await this.prisma.vehicle.count({ where: { status: VehicleStatus.MAINTENANCE } });

    // 2. Count upcoming/due schedules
    const dueSchedulesCount = await this.prisma.maintenanceSchedule.count({
      where: {
        status: { in: [MaintenanceStatus.DUE_SOON, MaintenanceStatus.OVERDUE] },
      },
    });

    // 3. Count documents expiring soon or expired
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

    // 4. Calculate total expenses this month
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

    // Add cost from Maintenance histories completed this month too!
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

    // 5. Top 5 vehicles with highest maintenance cost
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

    const top5Vehicles = await Promise.all(
      topVehiclesAgg.map(async (item) => {
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
      }),
    );

    // 6. Latest 5 maintenance records
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

    // 7. Important Reminders
    const schedulesReminder = await this.prisma.maintenanceSchedule.findMany({
      where: {
        status: { in: [MaintenanceStatus.DUE_SOON, MaintenanceStatus.OVERDUE] },
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

    // Dynamic helper to match status
    const calculateDocStatus = (expiryDate: Date) => {
      const diff = new Date(expiryDate).getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) return 'EXPIRED';
      if (days <= 30) return 'EXPIRES_SOON';
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
}
