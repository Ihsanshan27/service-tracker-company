import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
        status: string;
        message: string;
        data: any;
    }>;
}
