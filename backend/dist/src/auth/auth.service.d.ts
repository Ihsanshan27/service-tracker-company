import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private settingsService;
    constructor(prisma: PrismaService, jwtService: JwtService, settingsService: SettingsService);
    register(registerDto: RegisterDto): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            phone: string | null;
            isActive: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        status: string;
        message: string;
        data: {
            accessToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                role: import("@prisma/client").$Enums.UserRole;
                phone: string | null;
            };
        };
    }>;
}
