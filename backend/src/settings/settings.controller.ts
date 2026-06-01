import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public endpoint to check if public registration is enabled
  @Get('registration')
  async getRegistrationSetting() {
    const value = await this.settingsService.getSetting('registration_enabled');
    return {
      status: 'success',
      data: {
        registrationEnabled: value === 'true',
      },
    };
  }

  // Protected endpoints (SUPER_ADMIN only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.settingsService.getAllSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch()
  update(@Body() body: { key: string; value: string }) {
    return this.settingsService.setSetting(body.key, body.value);
  }
}
