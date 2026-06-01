import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOdometerDto } from './dto/create-odometer.dto';

@Injectable()
export class OdometerService {
  constructor(private prisma: PrismaService) {}

  async create(vehicleId: string, createOdometerDto: CreateOdometerDto, userId: string) {
    const { odometer, notes } = createOdometerDto;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
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

  async findAll(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException({
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
}
