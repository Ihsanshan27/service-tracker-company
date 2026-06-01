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
exports.CreateDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateDocumentDto {
    vehicleId;
    documentType;
    documentNumber;
    issueDate;
    expiryDate;
    provider;
    cost;
    documentUrl;
    notes;
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'ID Kendaraan harus berupa string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID Kendaraan tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DocumentType, { message: 'Tipe dokumen tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipe dokumen tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nomor dokumen tidak boleh kosong' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nomor dokumen tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal terbit tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tanggal terbit tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "issueDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal expired tidak valid' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tanggal expired tidak boleh kosong' }),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Provider harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Biaya harus berupa angka' }),
    (0, class_validator_1.Min)(0, { message: 'Biaya tidak boleh kurang dari 0' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDocumentDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'URL dokumen harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "documentUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Catatan harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "notes", void 0);
//# sourceMappingURL=create-document.dto.js.map