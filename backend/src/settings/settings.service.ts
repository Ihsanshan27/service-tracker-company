import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSetting(key: string): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      // Default fallback
      if (key === 'registration_enabled') {
        return 'true';
      }
      throw new NotFoundException({
        status: 'error',
        message: `Pengaturan dengan key '${key}' tidak ditemukan.`,
      });
    }
    return setting.value;
  }

  async setSetting(key: string, value: string) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return {
      status: 'success',
      message: 'Pengaturan berhasil diperbarui',
      data: setting,
    };
  }

  async getAllSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    
    // Ensure registration_enabled exists in results
    const hasReg = settings.some(s => s.key === 'registration_enabled');
    if (!hasReg) {
      settings.push({
        id: 'default-reg',
        key: 'registration_enabled',
        value: 'true',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return {
      status: 'success',
      message: 'Daftar pengaturan berhasil diambil',
      data: settings,
    };
  }
}
