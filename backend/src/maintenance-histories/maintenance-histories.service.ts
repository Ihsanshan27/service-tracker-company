import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class MaintenanceHistoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createHistoryDto: CreateHistoryDto, creatorId: string) {
    const { vehicleId, scheduleId, performedBy, serviceDate, odometerAtService, ...rest } = createHistoryDto;

    // 1. Verify Vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException({
        status: 'error',
        message: 'Kendaraan tidak ditemukan.',
      });
    }

    const sDate = new Date(serviceDate);

    // 2. Begin Prisma Transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // If odometer at service is greater than current vehicle odometer, update vehicle mileage and log it
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

      // If created from a schedule
      if (scheduleId) {
        const schedule = await tx.maintenanceSchedule.findUnique({
          where: { id: scheduleId },
        });

        if (!schedule) {
          throw new NotFoundException({
            status: 'error',
            message: 'Jadwal maintenance terkait tidak ditemukan.',
          });
        }

        // Mark schedule as COMPLETED
        await tx.maintenanceSchedule.update({
          where: { id: scheduleId },
          data: {
            status: MaintenanceStatus.COMPLETED,
            lastServiceDate: sDate,
            lastServiceOdometer: odometerAtService,
          },
        });

        // Automatically schedule next maintenance if intervals are set
        if (schedule.intervalKm || schedule.intervalMonth) {
          let nextDate: Date | null = null;
          let nextOdo: number | null = null;

          if (schedule.intervalMonth) {
            const tempDate = new Date(sDate);
            tempDate.setMonth(tempDate.getMonth() + schedule.intervalMonth);
            nextDate = tempDate;
          }

          if (schedule.intervalKm) {
            nextOdo = odometerAtService + schedule.intervalKm;
          }

          // Resolve next schedule's initial status based on the updated odometer
          let resolvedStatus: MaintenanceStatus = MaintenanceStatus.UPCOMING;
          const currentOdo = Math.max(vehicle.currentOdometer, odometerAtService);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (nextDate) {
            const nextDateCopy = new Date(nextDate);
            nextDateCopy.setHours(0, 0, 0, 0);
            const diffTime = nextDateCopy.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) resolvedStatus = MaintenanceStatus.OVERDUE;
            else if (diffDays <= 7) resolvedStatus = MaintenanceStatus.DUE_SOON;
          }

          if (nextOdo && resolvedStatus !== MaintenanceStatus.OVERDUE) {
            const diffKm = nextOdo - currentOdo;
            if (currentOdo > nextOdo) resolvedStatus = MaintenanceStatus.OVERDUE;
            else if (diffKm <= 500) resolvedStatus = MaintenanceStatus.DUE_SOON;
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

      // Create history entry
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

  async findAll(vehicleId?: string, maintenanceType?: string) {
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (maintenanceType) where.maintenanceType = maintenanceType;

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

  async findOne(id: string) {
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
      throw new NotFoundException({
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

  async update(id: string, updateHistoryDto: UpdateHistoryDto) {
    await this.findOne(id);

    const data: any = { ...updateHistoryDto };

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

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.maintenanceHistory.delete({
      where: { id },
    });

    return {
      status: 'success',
      message: 'Riwayat maintenance berhasil dihapus',
    };
  }
}
