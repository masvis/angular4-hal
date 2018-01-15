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
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var resource_helper_1 = require("./resource-helper");
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
exports.API_URI = new core_1.InjectionToken('api.uri');
var ResourceService = (function () {
    function ResourceService(root_uri, http) {
        this.root_uri = root_uri;
        this.http = http;
    }
    Object.defineProperty(ResourceService.prototype, "headers", {
        get: function () {
            return this._headers;
        },
        set: function (headers) {
            this._headers = headers;
        },
        enumerable: true,
        configurable: true
    });
    ResourceService.prototype.getURL = function () {
        return this.root_uri;
    };
    ResourceService.prototype.getHttp = function () {
        return this.http;
    };
    ResourceService.prototype.getAll = function (type, resource, options) {
        var uri = this.getResourceUrl(resource);
        var params = resource_helper_1.ResourceHelper.optionParams(new http_1.HttpParams(), options);
        var result = resource_helper_1.ResourceHelper.createEmptyResult(this.http);
        result.sortInfo = options ? options.sort : undefined;
        result.observable = this.http.get(uri, { headers: this.headers, params: params });
        return result.observable.map(function (response) { return resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result); });
    };
    ResourceService.prototype.get = function (type, resource, id) {
        var _this = this;
        var uri = this.getResourceUrl(resource).concat('/', id);
        var result = new type();
        result.observable = this.http.get(uri, { headers: this.headers });
        return result.observable.map(function (data) { return resource_helper_1.ResourceHelper.instantiateResource(result, data, _this.http); });
    };
    ResourceService.prototype.search = function (type, query, resource, options) {
        var uri = this.getResourceUrl(resource).concat('/search/', query);
        var params = resource_helper_1.ResourceHelper.optionParams(new http_1.HttpParams(), options);
        var result = resource_helper_1.ResourceHelper.createEmptyResult(this.http);
        result.observable = this.http.get(uri, { headers: this.headers, params: params });
        return result.observable.map(function (response) { return resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result); });
    };
    ResourceService.prototype.create = function (entity) {
        var uri = this.root_uri.concat(entity.path);
        var payload = resource_helper_1.ResourceHelper.resolveRelations(entity);
        return this.http.post(uri, payload, { headers: this.headers });
    };
    ResourceService.prototype.delete = function (resource) {
        return this.http.delete(resource._links.self.href, { headers: this.headers });
    };
    ResourceService.prototype.getResourceUrl = function (resource) {
        var url = this.root_uri;
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }
        return url;
    };
    ResourceService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(exports.API_URI)),
        __metadata("design:paramtypes", [String, http_1.HttpClient])
    ], ResourceService);
    return ResourceService;
}());
exports.ResourceService = ResourceService;
//# sourceMappingURL=resource.service.js.map