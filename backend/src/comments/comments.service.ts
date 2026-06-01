import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException({ status: 'error', message: 'Kendaraan tidak ditemukan.' });
    }

    const comments = await this.prisma.vehicleComment.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    return {
      status: 'success',
      data: comments,
    };
  }

  async create(vehicleId: string, userId: string, dto: CreateCommentDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException({ status: 'error', message: 'Kendaraan tidak ditemukan.' });
    }

    const comment = await this.prisma.vehicleComment.create({
      data: {
        vehicleId,
        userId,
        content: dto.content,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    return {
      status: 'success',
      message: 'Komentar berhasil ditambahkan.',
      data: comment,
    };
  }

  async remove(commentId: string, requestUserId: string, requestUserRole: string) {
    const comment = await this.prisma.vehicleComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException({ status: 'error', message: 'Komentar tidak ditemukan.' });
    }

    // Only comment owner or SUPER_ADMIN can delete
    if (comment.userId !== requestUserId && requestUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException({
        status: 'error',
        message: 'Kamu tidak memiliki izin untuk menghapus komentar ini.',
      });
    }

    await this.prisma.vehicleComment.delete({ where: { id: commentId } });

    return {
      status: 'success',
      message: 'Komentar berhasil dihapus.',
    };
  }
}
