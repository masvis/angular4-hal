"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var resource_service_1 = require("./src/resource.service");
__export(require("./src/resource.service"));
__export(require("./src/resource"));
__export(require("./src/resource.service"));
__export(require("./src/resource-array"));
var AngularHalModule = /** @class */ (function () {
    function AngularHalModule() {
    }
    AngularHalModule_1 = AngularHalModule;
    AngularHalModule.forRoot = function () {
        return {
            ngModule: AngularHalModule_1,
            providers: [
                resource_service_1.ResourceService
            ]
        };
    };
    AngularHalModule = AngularHalModule_1 = __decorate([
        core_1.NgModule({
            imports: [http_1.HttpClientModule],
            declarations: [],
            exports: [http_1.HttpClientModule],
            providers: [http_1.HttpClient]
        })
    ], AngularHalModule);
    return AngularHalModule;
    var AngularHalModule_1;
}());
exports.AngularHalModule = AngularHalModule;
//# sourceMappingURL=index.js.map