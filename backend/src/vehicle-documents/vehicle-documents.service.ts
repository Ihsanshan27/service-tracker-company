import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class VehicleDocumentsService {
  constructor(private prisma: PrismaService) {}

  private calculateDocumentStatus(expiryDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'EXPIRED';
    } else if (diffDays <= 30) {
      return 'EXPIRES_SOON';
    } else {
      return 'ACTIVE';
    }
  }

  private attachStatusToDoc(doc: any) {
    return {
      ...doc,
      status: this.calculateDocumentStatus(doc.expiryDate),
    };
  }

  async create(createDocumentDto: CreateDocumentDto) {
    const { vehicleId, issueDate, expiryDate, ...rest } = createDocumentDto;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException({
        status: 'error',
        message: 'Kendaraan tidak ditemukan.',
      });
    }

    const doc = await this.prisma.vehicleDocument.create({
      data: {
        ...rest,
        vehicleId,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
      },
    });

    return {
      status: 'success',
      message: 'Dokumen kendaraan berhasil ditambahkan',
      data: this.attachStatusToDoc(doc),
    };
  }

  async findAll(vehicleId?: string) {
    const where: any = {};
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const docs = await this.prisma.vehicleDocument.findMany({
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
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    const mappedDocs = docs.map((doc) => this.attachStatusToDoc(doc));

    return {
      status: 'success',
      message: 'Daftar dokumen kendaraan berhasil diambil',
      data: mappedDocs,
    };
  }

  async findOne(id: string) {
    const doc = await this.prisma.vehicleDocument.findUnique({
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

    if (!doc) {
      throw new NotFoundException({
        status: 'error',
        message: 'Dokumen kendaraan tidak ditemukan.',
      });
    }

    return {
      status: 'success',
      message: 'Detail dokumen kendaraan berhasil diambil',
      data: this.attachStatusToDoc(doc),
    };
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    await this.findOne(id);

    const data: any = { ...updateDocumentDto };

    if (updateDocumentDto.issueDate) {
      data.issueDate = new Date(updateDocumentDto.issueDate);
    }
    if (updateDocumentDto.expiryDate) {
      data.expiryDate = new Date(updateDocumentDto.expiryDate);
    }

    const updated = await this.prisma.vehicleDocument.update({
      where: { id },
      data,
    });

    return {
      status: 'success',
      message: 'Dokumen kendaraan berhasil diperbarui',
      data: this.attachStatusToDoc(updated),
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.vehicleDocument.delete({
      where: { id },
    });

    return {
      status: 'success',
      message: 'Dokumen kendaraan berhasil dihapus',
    };
  }
}
