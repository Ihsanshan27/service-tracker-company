"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleDocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_documents_service_1 = require("./vehicle-documents.service");
const vehicle_documents_controller_1 = require("./vehicle-documents.controller");
let VehicleDocumentsModule = class VehicleDocumentsModule {
};
exports.VehicleDocumentsModule = VehicleDocumentsModule;
exports.VehicleDocumentsModule = VehicleDocumentsModule = __decorate([
    (0, common_1.Module)({
        controllers: [vehicle_documents_controller_1.VehicleDocumentsController],
        providers: [vehicle_documents_service_1.VehicleDocumentsService],
        exports: [vehicle_documents_service_1.VehicleDocumentsService],
    })
], VehicleDocumentsModule);
//# sourceMappingURL=vehicle-documents.module.js.map