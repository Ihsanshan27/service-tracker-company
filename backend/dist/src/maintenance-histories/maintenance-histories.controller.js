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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceHistoriesController = void 0;
const common_1 = require("@nestjs/common");
const maintenance_histories_service_1 = require("./maintenance-histories.service");
const create_history_dto_1 = require("./dto/create-history.dto");
const update_history_dto_1 = require("./dto/update-history.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MaintenanceHistoriesController = class MaintenanceHistoriesController {
    historiesService;
    constructor(historiesService) {
        this.historiesService = historiesService;
    }
    create(createHistoryDto, req) {
        return this.historiesService.create(createHistoryDto, req.user.id);
    }
    findAll(vehicleId, maintenanceType) {
        return this.historiesService.findAll(vehicleId, maintenanceType);
    }
    findOne(id) {
        return this.historiesService.findOne(id);
    }
    update(id, updateHistoryDto) {
        return this.historiesService.update(id, updateHistoryDto);
    }
    remove(id) {
        return this.historiesService.remove(id);
    }
};
exports.MaintenanceHistoriesController = MaintenanceHistoriesController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FLEET_MANAGER, client_1.UserRole.MECHANIC),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_history_dto_1.CreateHistoryDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceHistoriesController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FLEET_MANAGER, client_1.UserRole.MECHANIC, client_1.UserRole.DRIVER, client_1.UserRole.FINANCE),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('vehicleId')),
    __param(1, (0, common_1.Query)('maintenanceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceHistoriesController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FLEET_MANAGER, client_1.UserRole.MECHANIC, client_1.UserRole.DRIVER, client_1.UserRole.FINANCE),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceHistoriesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FLEET_MANAGER),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_history_dto_1.UpdateHistoryDto]),
    __metadata("design:returntype", void 0)
], MaintenanceHistoriesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FLEET_MANAGER),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceHistoriesController.prototype, "remove", null);
exports.MaintenanceHistoriesController = MaintenanceHistoriesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('maintenance-histories'),
    __metadata("design:paramtypes", [maintenance_histories_service_1.MaintenanceHistoriesService])
], MaintenanceHistoriesController);
//# sourceMappingURL=maintenance-histories.controller.js.map