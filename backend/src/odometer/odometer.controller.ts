import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OdometerService } from './odometer.service';
import { CreateOdometerDto } from './dto/create-odometer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles/:vehicleId/odometer')
export class OdometerController {
  constructor(private readonly odometerService: OdometerService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER)
  @Post()
  create(
    @Param('vehicleId') vehicleId: string,
    @Body() createOdometerDto: CreateOdometerDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.odometerService.create(vehicleId, createOdometerDto, userId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get()
  findAll(@Param('vehicleId') vehicleId: string) {
    return this.odometerService.findAll(vehicleId);
  }
}
