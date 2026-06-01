import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MaintenanceSchedulesService } from './maintenance-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, MaintenanceStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('maintenance-schedules')
export class MaintenanceSchedulesController {
  constructor(private readonly schedulesService: MaintenanceSchedulesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get()
  findAll(
    @Query('status') status?: MaintenanceStatus,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.schedulesService.findAll(status, vehicleId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
