"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { email, password, name, role, phone } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException({
                status: 'error',
                message: 'Email sudah terdaftar.',
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                phone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });
        return {
            status: 'success',
            message: 'User berhasil dibuat',
            data: user,
        };
    }
    async findAll(role) {
        const where = {};
        if (role) {
            where.role = role;
        }
        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            status: 'success',
            message: 'Daftar user berhasil diambil',
            data: users,
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'User tidak ditemukan.',
            });
        }
        return {
            status: 'success',
            message: 'Detail user berhasil diambil',
            data: user,
        };
    }
    async update(id, updateUserDto) {
        await this.findOne(id);
        const data = { ...updateUserDto };
        if (updateUserDto.email) {
            const emailUser = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (emailUser && emailUser.id !== id) {
                throw new common_1.ConflictException({
                    status: 'error',
                    message: 'Email sudah digunakan oleh user lain.',
                });
            }
        }
        if (updateUserDto.password) {
            data.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });
        return {
            status: 'success',
            message: 'User berhasil diperbarui',
            data: updatedUser,
        };
    }
    async remove(id) {
        await this.findOne(id);
        const userToDelete = await this.prisma.user.findUnique({ where: { id } });
        if (userToDelete?.role === 'SUPER_ADMIN') {
            const superAdmins = await this.prisma.user.findMany({
                where: { role: 'SUPER_ADMIN', isActive: true },
            });
            if (superAdmins.length <= 1) {
                throw new common_1.BadRequestException({
                    status: 'error',
                    message: 'Tidak dapat menghapus SUPER_ADMIN terakhir yang aktif.',
                });
            }
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return {
            status: 'success',
            message: 'User berhasil dihapus',
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map