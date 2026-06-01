"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVehicleDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateVehicleDto {
    plateNumber;
    brand;
    model;
    year;
    color;
    vehicleType;
    fuelType;
    transmission;
    chassisNumber;
    engineNumber;
    currentOdometer;
    status;
    purchaseDate;
    notes;
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nomor polisi harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nomor polisi tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "plateNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Merk harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Merk tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Model harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Model tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Tahun harus berupa integer' }),
    (0, class_validator_1.Min)(1900, { message: 'Tahun tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tahun tidak boleh kosong' }),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Warna harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Warna tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tipe kendaraan harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipe kendaraan tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tipe bahan bakar harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipe bahan bakar tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "fuelType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Transmisi harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Transmisi tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "transmission", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nomor rangka harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nomor rangka tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "chassisNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nomor mesin harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nomor mesin tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "engineNumber", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Odometer harus berupa integer' }),
    (0, class_validator_1.Min)(0, { message: 'Odometer tidak boleh kurang dari 0' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Odometer tidak boleh kosong' }),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "currentOdometer", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.VehicleStatus, { message: 'Status tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal pembelian tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tanggal pembelian tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Catatan harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "notes", void 0);
//# sourceMappingURL=create-vehicle.dto.js.map