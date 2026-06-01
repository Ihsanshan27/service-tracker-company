import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class MaintenanceSchedulesService {
  constructor(private prisma: PrismaService) {}

  // Helper to determine status dynamically based on current date & odometer
  private resolveScheduleStatus(schedule: {
    status: MaintenanceStatus;
    nextServiceDate?: Date | null;
    nextServiceOdometer?: number | null;
  }, currentOdometer: number): MaintenanceStatus {
    if (schedule.status === MaintenanceStatus.COMPLETED) {
      return MaintenanceStatus.COMPLETED;
    }

    let resolvedStatus: MaintenanceStatus = MaintenanceStatus.UPCOMING;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check Date
    if (schedule.nextServiceDate) {
      const nextDate = new Date(schedule.nextServiceDate);
      nextDate.setHours(0, 0, 0, 0);
      
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        resolvedStatus = MaintenanceStatus.OVERDUE;
      } else if (diffDays <= 7) {
        resolvedStatus = MaintenanceStatus.DUE_SOON;
      }
    }

    // 2. Check Odometer
    if (schedule.nextServiceOdometer) {
      const diffKm = schedule.nextServiceOdometer - currentOdometer;

      if (currentOdometer > schedule.nextServiceOdometer) {
        resolvedStatus = MaintenanceStatus.OVERDUE;
      } else if (diffKm <= 500) {
        // If it's already overdue by date, keep it overdue. Otherwise, make it due soon.
        if (resolvedStatus !== MaintenanceStatus.OVERDUE) {
          resolvedStatus = MaintenanceStatus.DUE_SOON;
        }
      }
    }

    return resolvedStatus;
  }

  // Calculate next service date & odometer
  private calculateNextValues(data: {
    intervalKm?: number;
    intervalMonth?: number;
    lastServiceDate?: Date;
    lastServiceOdometer?: number;
  }) {
    let nextServiceDate: Date | null = null;
    let nextServiceOdometer: number | null = null;

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

  async create(createScheduleDto: CreateScheduleDto) {
    const { vehicleId, lastServiceDate, lastServiceOdometer, ...rest } = createScheduleDto;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException({
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

    // Create temp schedule to resolve the correct initial status
    const tempSchedule = {
      status: MaintenanceStatus.UPCOMING,
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

  async findAll(status?: MaintenanceStatus, vehicleId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;

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

    // Dynamically update status and save it in background if it changed!
    const updatedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
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
      }),
    );

    return {
      status: 'success',
      message: 'Daftar jadwal maintenance berhasil diambil',
      data: updatedSchedules,
    };
  }

  async findOne(id: string) {
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
      throw new NotFoundException({
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

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const existingScheduleResult = await this.findOne(id);
    const existingSchedule = existingScheduleResult.data;
    const vehicle = existingSchedule.vehicle;

    const data: any = { ...updateScheduleDto };

    if (updateScheduleDto.lastServiceDate) {
      data.lastServiceDate = new Date(updateScheduleDto.lastServiceDate);
    }

    // Re-calculate next values if intervals or last service parameters change
    if (
      updateScheduleDto.lastServiceDate ||
      updateScheduleDto.lastServiceOdometer !== undefined ||
      updateScheduleDto.intervalKm ||
      updateScheduleDto.intervalMonth
    ) {
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

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.maintenanceSchedule.delete({
      where: { id },
    });

    return {
      status: 'success',
      message: 'Jadwal maintenance berhasil dihapus',
    };
  }
}
