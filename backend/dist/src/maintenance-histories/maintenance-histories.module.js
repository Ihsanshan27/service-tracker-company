"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceHistoriesModule = void 0;
const common_1 = require("@nestjs/common");
const maintenance_histories_service_1 = require("./maintenance-histories.service");
const maintenance_histories_controller_1 = require("./maintenance-histories.controller");
let MaintenanceHistoriesModule = class MaintenanceHistoriesModule {
};
exports.MaintenanceHistoriesModule = MaintenanceHistoriesModule;
exports.MaintenanceHistoriesModule = MaintenanceHistoriesModule = __decorate([
    (0, common_1.Module)({
        controllers: [maintenance_histories_controller_1.MaintenanceHistoriesController],
        providers: [maintenance_histories_service_1.MaintenanceHistoriesService],
        exports: [maintenance_histories_service_1.MaintenanceHistoriesService],
    })
], MaintenanceHistoriesModule);
//# sourceMappingURL=maintenance-histories.module.js.map