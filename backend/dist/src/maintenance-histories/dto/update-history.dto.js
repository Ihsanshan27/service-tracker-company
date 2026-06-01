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
exports.UpdateHistoryDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateHistoryDto {
    maintenanceType;
    title;
    description;
    serviceDate;
    odometerAtService;
    workshopName;
    cost;
    status;
    notes;
}
exports.UpdateHistoryDto = UpdateHistoryDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.MaintenanceType, { message: 'Tipe maintenance tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "maintenanceType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Judul harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Deskripsi harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal service tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "serviceDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Odometer saat service harus berupa integer' }),
    (0, class_validator_1.Min)(0, { message: 'Odometer tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateHistoryDto.prototype, "odometerAtService", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nama bengkel harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "workshopName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Biaya harus berupa angka' }),
    (0, class_validator_1.Min)(0, { message: 'Biaya tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateHistoryDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Status harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Catatan harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateHistoryDto.prototype, "notes", void 0);
//# sourceMappingURL=update-history.dto.js.map