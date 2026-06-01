import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateOdometerDto } from './dto/update-odometer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, VehicleStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto, @Request() req: any) {
    return this.vehiclesService.create(createVehicleDto, req.user.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: VehicleStatus,
    @Query('vehicleType') vehicleType?: string,
  ) {
    return this.vehiclesService.findAll(search, status, vehicleType);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Request() req: any) {
    return this.vehiclesService.update(id, updateVehicleDto, req.user.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.vehiclesService.remove(id, req.user.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER)
  @Patch(':id/odometer')
  updateOdometer(
    @Param('id') id: string,
    @Body() updateOdometerDto: UpdateOdometerDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.vehiclesService.updateOdometer(id, updateOdometerDto, userId);
  }
}

