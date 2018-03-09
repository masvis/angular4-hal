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
var http_1 = require("@angular/common/http");
var core_1 = require("@angular/core");
var resource_helper_1 = require("./resource-helper");
exports.API_URI = new core_1.InjectionToken('api.uri');
exports.PROXY_URI = new core_1.InjectionToken('proxy.uri');
var ExternalService = /** @class */ (function () {
    function ExternalService(root_uri, proxy_uri, http) {
        this.root_uri = root_uri;
        this.proxy_uri = proxy_uri;
        this.http = http;
        resource_helper_1.ResourceHelper.setProxyUri(this.proxy_uri);
        resource_helper_1.ResourceHelper.setRootUri(this.root_uri);
    }
    ExternalService.prototype.getURL = function () {
        return resource_helper_1.ResourceHelper.getURL();
    };
    ExternalService.prototype.getHttp = function () {
        return this.http;
    };
    ExternalService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(exports.API_URI)),
        __param(1, core_1.Inject(exports.PROXY_URI)),
        __metadata("design:paramtypes", [String, String, http_1.HttpClient])
    ], ExternalService);
    return ExternalService;
}());
exports.ExternalService = ExternalService;
//# sourceMappingURL=external.service.js.map