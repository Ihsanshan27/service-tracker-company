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
exports.UpdateDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateDocumentDto {
    documentType;
    documentNumber;
    issueDate;
    expiryDate;
    provider;
    cost;
    documentUrl;
    notes;
}
exports.UpdateDocumentDto = UpdateDocumentDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DocumentType, { message: 'Tipe dokumen tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nomor dokumen harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal terbit tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "issueDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Format tanggal expired tidak valid' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Provider harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Biaya harus berupa angka' }),
    (0, class_validator_1.Min)(0, { message: 'Biaya tidak boleh kurang dari 0' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDocumentDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'URL dokumen harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "documentUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Catatan harus berupa string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "notes", void 0);
//# sourceMappingURL=update-document.dto.js.map