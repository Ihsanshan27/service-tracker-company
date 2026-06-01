import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VehicleDocumentsService } from './vehicle-documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicle-documents')
export class VehicleDocumentsController {
  constructor(private readonly documentsService: VehicleDocumentsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get()
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.documentsService.findAll(vehicleId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER, UserRole.MECHANIC, UserRole.DRIVER, UserRole.FINANCE)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.FLEET_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
