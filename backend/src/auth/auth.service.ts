import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private settingsService: SettingsService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Check if registration is globally enabled
    const regEnabled = await this.settingsService.getSetting('registration_enabled');
    if (regEnabled !== 'true') {
      throw new ForbiddenException({
        status: 'error',
        message: 'Pendaftaran akun mandiri saat ini dinonaktifkan oleh administrator.',
      });
    }

    const { email, password, name, phone } = registerDto;

    // 2. Check if email already exists
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

    // 3. Create user with default role: DRIVER
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.DRIVER, // Default role for self-registration
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
      message: 'Pendaftaran akun berhasil, silakan login',
      data: user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Email atau password salah.',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Email atau password salah.',
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      status: 'success',
      message: 'Login berhasil',
      data: {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
    };
  }
}
