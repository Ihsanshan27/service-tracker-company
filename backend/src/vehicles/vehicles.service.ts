import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateOdometerDto } from './dto/update-odometer.dto';
import { VehicleStatus } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, userId?: string) {
    const { plateNumber, purchaseDate, ...rest } = createVehicleDto;

    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { plateNumber },
    });

    if (existingVehicle) {
      throw new ConflictException({
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

  async findAll(search?: string, status?: VehicleStatus, vehicleType?: string) {
    const where: any = {};

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

  async findOne(id: string) {
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
      throw new NotFoundException({
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

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId?: string) {
    const existing = await this.findOne(id);

    const data: any = { ...updateVehicleDto };

    if (updateVehicleDto.plateNumber) {
      data.plateNumber = updateVehicleDto.plateNumber.toUpperCase();
      const existingVehicle = await this.prisma.vehicle.findUnique({
        where: { plateNumber: data.plateNumber },
      });
      if (existingVehicle && existingVehicle.id !== id) {
        throw new ConflictException({
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
        oldValues: existing.data as any,
        newValues: updateVehicleDto as any,
      });
    }

    return {
      status: 'success',
      message: 'Kendaraan berhasil diperbarui',
      data: updatedVehicle,
    };
  }

  async remove(id: string, userId?: string) {
    const existing = await this.findOne(id);
    const vehicle = existing.data as any;

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

  async updateOdometer(id: string, updateOdometerDto: UpdateOdometerDto, userId: string) {
    const { odometer, notes } = updateOdometerDto;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException({
        status: 'error',
        message: 'Kendaraan tidak ditemukan.',
      });
    }

    // Validation: New odometer cannot be smaller than current odometer!
    if (odometer < vehicle.currentOdometer) {
      throw new BadRequestException({
        status: 'error',
        message: `Nilai odometer baru (${odometer} km) tidak boleh lebih kecil dari odometer saat ini (${vehicle.currentOdometer} km).`,
      });
    }

    // Wrap in a transaction: update vehicle and create odometer log
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
}
