import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, userRole: string) {
    if (!query || query.trim().length < 2) {
      return {
        status: 'success',
        data: { vehicles: [], documents: [], histories: [], users: [] },
      };
    }

    const q = query.trim();

    const [vehicles, documents, histories, users] = await Promise.all([
      // Search vehicles
      this.prisma.vehicle.findMany({
        where: {
          OR: [
            { plateNumber: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { model: { contains: q, mode: 'insensitive' } },
            { color: { contains: q, mode: 'insensitive' } },
            { vehicleType: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          year: true,
          status: true,
          vehicleType: true,
        },
      }),

      // Search documents
      this.prisma.vehicleDocument.findMany({
        where: {
          OR: [
            { documentNumber: { contains: q, mode: 'insensitive' } },
            { provider: { contains: q, mode: 'insensitive' } },
            { notes: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          documentType: true,
          documentNumber: true,
          expiryDate: true,
          vehicleId: true,
          vehicle: {
            select: { plateNumber: true, brand: true, model: true },
          },
        },
      }),

      // Search maintenance histories
      this.prisma.maintenanceHistory.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { workshopName: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          maintenanceType: true,
          serviceDate: true,
          workshopName: true,
          vehicleId: true,
          vehicle: {
            select: { plateNumber: true, brand: true, model: true },
          },
        },
      }),

      // Search users (only for SUPER_ADMIN and FLEET_MANAGER)
      ['SUPER_ADMIN', 'FLEET_MANAGER'].includes(userRole)
        ? this.prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          })
        : Promise.resolve([]),
    ]);

    return {
      status: 'success',
      data: { vehicles, documents, histories, users },
    };
  }
}
