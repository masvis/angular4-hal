"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var resource_service_1 = require("./resource.service");
var RestService = (function () {
    function RestService(type, resource, injector) {
        this.injector = injector;
        this.type = type;
        this.resource = resource;
        this.resourceService = injector.get(resource_service_1.ResourceService);
    }
    RestService.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error);
    };
    RestService.prototype.getAll = function () {
        var _this = this;
        return this.resourceService.getAll(this.type, this.resource)
            .map(function (resourceArray) {
            _this.resourceArray = resourceArray;
            return resourceArray.result;
        });
    };
    RestService.prototype.get = function (id) {
        return this.resourceService.get(this.type, this.resource, id);
    };
    RestService.prototype.search = function (query, options) {
        var _this = this;
        return this.resourceService.search(this.type, query, this.resource, options)
            .map(function (resourceArray) {
            _this.resourceArray = resourceArray;
            return resourceArray.result;
        });
    };
    RestService.prototype.count = function () {
        return this.resourceService.count(this.resource);
    };
    RestService.prototype.create = function (entity) {
        return this.resourceService.create(this.resource, entity);
    };
    RestService.prototype.update = function (entity) {
        return this.resourceService.update(entity);
    };
    RestService.prototype.patch = function (entity) {
        return this.resourceService.patch(entity);
    };
    RestService.prototype.delete = function (entity) {
        return this.resourceService.delete(entity);
    };
    RestService.prototype.totalElement = function () {
        if (this.resourceArray && this.resourceArray.totalElements)
            return this.resourceArray.totalElements;
        return 0;
    };
    RestService.prototype.hasNext = function () {
        if (this.resourceArray)
            return this.resourceService.hasNext(this.resourceArray);
        return false;
    };
    RestService.prototype.hasPrev = function () {
        if (this.resourceArray)
            return this.resourceService.hasPrev(this.resourceArray);
        return false;
    };
    RestService.prototype.next = function () {
        var _this = this;
        if (this.resourceArray)
            return this.resourceService.next(this.resourceArray, this.type)
                .map(function (resourceArray) {
                _this.resourceArray = resourceArray;
                return resourceArray.result;
            });
        else
            Observable_1.Observable.throw('no resourceArray found');
    };
    RestService.prototype.prev = function () {
        var _this = this;
        if (this.resourceArray)
            return this.resourceService.prev(this.resourceArray, this.type)
                .map(function (resourceArray) {
                _this.resourceArray = resourceArray;
                return resourceArray.result;
            });
        else
            Observable_1.Observable.throw('no resourceArray found');
    };
    RestService.prototype.first = function () {
        var _this = this;
        if (this.resourceArray)
            return this.resourceService.first(this.resourceArray, this.type)
                .map(function (resourceArray) {
                _this.resourceArray = resourceArray;
                return resourceArray.result;
            });
        else
            Observable_1.Observable.throw('no resourceArray found');
    };
    RestService.prototype.last = function () {
        var _this = this;
        if (this.resourceArray)
            return this.resourceService.last(this.resourceArray, this.type)
                .map(function (resourceArray) {
                _this.resourceArray = resourceArray;
                return resourceArray.result;
            });
        else
            Observable_1.Observable.throw('no resourceArray found');
    };
    return RestService;
}());
exports.RestService = RestService;
//# sourceMappingURL=rest.service.js.map