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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSetting(key) {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            if (key === 'registration_enabled') {
                return 'true';
            }
            throw new common_1.NotFoundException({
                status: 'error',
                message: `Pengaturan dengan key '${key}' tidak ditemukan.`,
            });
        }
        return setting.value;
    }
    async setSetting(key, value) {
        const setting = await this.prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        return {
            status: 'success',
            message: 'Pengaturan berhasil diperbarui',
            data: setting,
        };
    }
    async getAllSettings() {
        const settings = await this.prisma.systemSetting.findMany();
        const hasReg = settings.some(s => s.key === 'registration_enabled');
        if (!hasReg) {
            settings.push({
                id: 'default-reg',
                key: 'registration_enabled',
                value: 'true',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        return {
            status: 'success',
            message: 'Daftar pengaturan berhasil diambil',
            data: settings,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map