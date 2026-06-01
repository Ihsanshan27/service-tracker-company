import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getRegistrationSetting(): Promise<{
        status: string;
        data: {
            registrationEnabled: boolean;
        };
    }>;
    findAll(): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            key: string;
            value: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    update(body: {
        key: string;
        value: string;
    }): Promise<{
        status: string;
        message: string;
        data: {
            id: string;
            key: string;
            value: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
