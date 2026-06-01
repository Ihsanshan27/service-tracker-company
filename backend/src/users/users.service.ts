import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, role, phone } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException({
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

  async findAll(role?: string) {
    const where: any = {};
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

  async findOne(id: string) {
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
      throw new NotFoundException({
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    const data: any = { ...updateUserDto };

    if (updateUserDto.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailUser && emailUser.id !== id) {
        throw new ConflictException({
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

  async remove(id: string) {
    // Check if user exists
    await this.findOne(id);

    // Prevent deleting the very last SUPER_ADMIN
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (userToDelete?.role === 'SUPER_ADMIN') {
      const superAdmins = await this.prisma.user.findMany({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });
      if (superAdmins.length <= 1) {
        throw new BadRequestException({
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
}
