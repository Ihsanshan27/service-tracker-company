import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { MaintenanceHistoriesService } from './maintenance-histories.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('maintenance-histories')
export class MaintenanceHistoriesController {
  constructor(private readonly historiesService: MaintenanceHistoriesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC)
  @Post()
  create(@Body() createHistoryDto: CreateHistoryDto, @Request() req) {
    return this.historiesService.create(createHistoryDto, req.user.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get()
  findAll(
    @Query('vehicleId') vehicleId?: string,
    @Query('maintenanceType') maintenanceType?: string,
  ) {
    return this.historiesService.findAll(vehicleId, maintenanceType);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historiesService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historiesService.update(id, updateHistoryDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historiesService.remove(id);
  }
}
