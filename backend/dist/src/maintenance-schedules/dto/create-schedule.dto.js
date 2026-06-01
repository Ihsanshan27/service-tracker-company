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
exports.CreateScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateScheduleDto {
    vehicleId;
    title;
    description;
    maintenanceType;
    intervalKm;
    intervalMonth;
    lastServiceDate;
    lastServiceOdometer;
}
exports.CreateScheduleDto = CreateScheduleDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'ID Kendaraan harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID Kendaraan tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Judul jadwal tidak boleh kosong' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Judul jadwal tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Deskripsi harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.MaintenanceType, { message: 'Tipe maintenance tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipe maintenance tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "maintenanceType", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Interval kilometer harus berupa integer' }),
    (0, class_validator_1.Min)(1, { message: 'Interval kilometer tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "intervalKm", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Interval bulan harus berupa integer' }),
    (0, class_validator_1.Min)(1, { message: 'Interval bulan tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "intervalMonth", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal service terakhir tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "lastServiceDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Odometer service terakhir harus berupa integer' }),
    (0, class_validator_1.Min)(0, { message: 'Odometer service terakhir tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "lastServiceOdometer", void 0);
//# sourceMappingURL=create-schedule.dto.js.map