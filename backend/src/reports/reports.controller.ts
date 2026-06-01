import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.FLEET_MANAGER,
    UserRole.FINANCE,
    UserRole.DRIVER,
    UserRole.MECHANIC
  )
  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboard();
  }
}
