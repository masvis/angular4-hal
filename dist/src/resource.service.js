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
Object.defineProperty(exports, "__esModule", { value: true });
var resource_helper_1 = require("./resource-helper");
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var external_service_1 = require("./external.service");
var ResourceService = /** @class */ (function () {
    function ResourceService(externalService) {
        this.externalService = externalService;
    }
    ResourceService_1 = ResourceService;
    ResourceService.getURL = function () {
        return resource_helper_1.ResourceHelper.getURL();
    };
    ResourceService.prototype.getHttp = function () {
        return this.externalService.getHttp();
    };
    ResourceService.prototype.getAll = function (type, resource, options) {
        var uri = this.getResourceUrl(resource);
        var params = resource_helper_1.ResourceHelper.optionParams(new http_1.HttpParams(), options);
        var result = resource_helper_1.ResourceHelper.createEmptyResult(this.getHttp());
        this.setUrls(result);
        result.sortInfo = options ? options.sort : undefined;
        result.observable = this.getHttp().get(uri, { headers: resource_helper_1.ResourceHelper.headers, params: params });
        return result.observable.map(function (response) { return resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result); });
    };
    ResourceService.prototype.get = function (type, resource, id) {
        var _this = this;
        var uri = this.getResourceUrl(resource).concat('/', id);
        var result = new type();
        this.setUrlsResource(result);
        result.observable = this.getHttp().get(uri, { headers: resource_helper_1.ResourceHelper.headers });
        return result.observable.map(function (data) { return resource_helper_1.ResourceHelper.instantiateResource(result, data, _this.getHttp()); });
    };
    ResourceService.prototype.search = function (type, query, resource, options) {
        var uri = this.getResourceUrl(resource).concat('/search/', query);
        var params = resource_helper_1.ResourceHelper.optionParams(new http_1.HttpParams(), options);
        var result = resource_helper_1.ResourceHelper.createEmptyResult(this.getHttp());
        this.setUrls(result);
        result.observable = this.getHttp().get(uri, { headers: resource_helper_1.ResourceHelper.headers, params: params });
        return result.observable.map(function (response) { return resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result); });
    };
    ResourceService.prototype.create = function (entity) {
        var uri = resource_helper_1.ResourceHelper.getProxy(entity._links.self.href);
        var payload = resource_helper_1.ResourceHelper.resolveRelations(entity);
        return this.getHttp().post(uri, payload, { headers: resource_helper_1.ResourceHelper.headers });
    };
    ResourceService.prototype.update = function (entity) {
        var uri = resource_helper_1.ResourceHelper.getProxy(entity._links.self.href);
        var payload = resource_helper_1.ResourceHelper.resolveRelations(entity);
        return this.getHttp().put(uri, payload, { headers: resource_helper_1.ResourceHelper.headers });
    };
    ResourceService.prototype.patch = function (entity) {
        var uri = resource_helper_1.ResourceHelper.getProxy(entity._links.self.href);
        var payload = resource_helper_1.ResourceHelper.resolveRelations(entity);
        return this.getHttp().patch(uri, payload, { headers: resource_helper_1.ResourceHelper.headers });
    };
    ResourceService.prototype.delete = function (entity) {
        var uri = resource_helper_1.ResourceHelper.getProxy(entity._links.self.href);
        return this.getHttp().delete(uri, { headers: resource_helper_1.ResourceHelper.headers });
    };
    ResourceService.prototype.hasNext = function (resourceArray) {
        return resourceArray.next_uri != undefined;
    };
    ResourceService.prototype.hasPrev = function (resourceArray) {
        return resourceArray.prev_uri != undefined;
    };
    ResourceService.prototype.hasFirst = function (resourceArray) {
        return resourceArray.first_uri != undefined;
    };
    ResourceService.prototype.hasLast = function (resourceArray) {
        return resourceArray.last_uri != undefined;
    };
    ResourceService.prototype.next = function (resourceArray, type) {
        return resourceArray.next(type);
    };
    ResourceService.prototype.prev = function (resourceArray, type) {
        return resourceArray.prev(type);
    };
    ResourceService.prototype.first = function (resourceArray, type) {
        return resourceArray.first(type);
    };
    ResourceService.prototype.last = function (resourceArray, type) {
        return resourceArray.last(type);
    };
    ResourceService.prototype.page = function (resourceArray, type, id) {
        return resourceArray.page(type, id);
    };
    ResourceService.prototype.sortElements = function (resourceArray, type) {
        var sort = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            sort[_i - 2] = arguments[_i];
        }
        return resourceArray.sortElements.apply(resourceArray, [type].concat(sort));
    };
    ResourceService.prototype.size = function (resourceArray, type, size) {
        return resourceArray.size(type, size);
    };
    ResourceService.prototype.getResourceUrl = function (resource) {
        var url = ResourceService_1.getURL();
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }
        return url;
    };
    ResourceService.prototype.setUrls = function (result) {
        result.proxyUrl = this.externalService.proxy_uri;
        result.rootUrl = this.externalService.root_uri;
    };
    ResourceService.prototype.setUrlsResource = function (result) {
        result.proxyUrl = this.externalService.proxy_uri;
        result.rootUrl = this.externalService.root_uri;
    };
    ResourceService = ResourceService_1 = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [external_service_1.ExternalService])
    ], ResourceService);
    return ResourceService;
    var ResourceService_1;
}());
exports.ResourceService = ResourceService;
//# sourceMappingURL=resource.service.js.map