"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var external_service_1 = require("./src/external.service");
var resource_service_1 = require("./src/resource.service");
var external_service_2 = require("./src/external.service");
exports.API_URI = external_service_2.API_URI;
exports.PROXY_URI = external_service_2.PROXY_URI;
exports.ExternalService = external_service_2.ExternalService;
var rest_service_1 = require("./src/rest.service");
exports.RestService = rest_service_1.RestService;
var resource_1 = require("./src/resource");
exports.Resource = resource_1.Resource;
var resource_array_1 = require("./src/resource-array");
exports.ResourceArray = resource_array_1.ResourceArray;
var resource_helper_1 = require("./src/resource-helper");
exports.ResourceHelper = resource_helper_1.ResourceHelper;
var AngularHalModule = /** @class */ (function () {
    function AngularHalModule() {
    }
    AngularHalModule_1 = AngularHalModule;
    AngularHalModule.forRoot = function () {
        return {
            ngModule: AngularHalModule_1,
            providers: [
                external_service_1.ExternalService
            ]
        };
    };
    AngularHalModule = AngularHalModule_1 = __decorate([
        core_1.NgModule({
            imports: [http_1.HttpClientModule],
            declarations: [],
            exports: [http_1.HttpClientModule],
            providers: [http_1.HttpClient, resource_service_1.ResourceService]
        })
    ], AngularHalModule);
    return AngularHalModule;
    var AngularHalModule_1;
}());
exports.AngularHalModule = AngularHalModule;
//# sourceMappingURL=index.js.map