"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdometerModule = void 0;
const common_1 = require("@nestjs/common");
const odometer_service_1 = require("./odometer.service");
const odometer_controller_1 = require("./odometer.controller");
let OdometerModule = class OdometerModule {
};
exports.OdometerModule = OdometerModule;
exports.OdometerModule = OdometerModule = __decorate([
    (0, common_1.Module)({
        controllers: [odometer_controller_1.OdometerController],
        providers: [odometer_service_1.OdometerService],
        exports: [odometer_service_1.OdometerService],
    })
], OdometerModule);
//# sourceMappingURL=odometer.module.js.map