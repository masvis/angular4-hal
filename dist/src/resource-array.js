"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var resource_helper_1 = require("./resource-helper");
var ResourceArray = /** @class */ (function () {
    function ResourceArray() {
        var _this = this;
        this.totalElements = 0;
        this.totalPages = 1;
        this.pageNumber = 1;
        this.result = [];
        this.push = function (el) {
            _this.result.push(el);
        };
        this.length = function () {
            return _this.result.length;
        };
        this.init = function (type, response, sortInfo) {
            var result = resource_helper_1.ResourceHelper.createEmptyResult(_this.http);
            result.sortInfo = sortInfo;
            resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result);
            return result;
        };
        // Load next page
        this.next = function (type) {
            if (_this.next_uri) {
                return _this.http.get(resource_helper_1.ResourceHelper.getProxy(_this.next_uri), { headers: resource_helper_1.ResourceHelper.headers })
                    .map(function (response) { return _this.init(type, response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
            return Observable_1.Observable.throw("no next defined");
        };
        this.prev = function (type) {
            if (_this.prev_uri) {
                return _this.http.get(resource_helper_1.ResourceHelper.getProxy(_this.prev_uri), { headers: resource_helper_1.ResourceHelper.headers })
                    .map(function (response) { return _this.init(type, response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
            return Observable_1.Observable.throw("no prev defined");
        };
        // Load first page
        this.first = function (type) {
            if (_this.first_uri) {
                return _this.http.get(resource_helper_1.ResourceHelper.getProxy(_this.first_uri), { headers: resource_helper_1.ResourceHelper.headers })
                    .map(function (response) { return _this.init(type, response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
            return Observable_1.Observable.throw("no first defined");
        };
        // Load last page
        this.last = function (type) {
            if (_this.last_uri) {
                return _this.http.get(resource_helper_1.ResourceHelper.getProxy(_this.last_uri), { headers: resource_helper_1.ResourceHelper.headers })
                    .map(function (response) { return _this.init(type, response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
            return Observable_1.Observable.throw("no last defined");
        };
        // Load page with given pageNumber
        this.page = function (type, id) {
            var uri = resource_helper_1.ResourceHelper.getProxy(_this.self_uri).concat('?', 'size=', _this.pageSize.toString(), '&page=', id.toString());
            for (var _i = 0, _a = _this.sortInfo; _i < _a.length; _i++) {
                var item = _a[_i];
                uri.concat('&sort=', item.path, ',', item.order);
            }
            return _this.http.get(uri, { headers: resource_helper_1.ResourceHelper.headers })
                .map(function (response) { return _this.init(type, response, _this.sortInfo); })
                .catch(function (error) { return Observable_1.Observable.throw(error); });
        };
        // Sort collection based on given sort attribute
        this.sortElements = function (type) {
            var sort = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sort[_i - 1] = arguments[_i];
            }
            var uri = resource_helper_1.ResourceHelper.getProxy(_this.self_uri).concat('?', 'size=', _this.pageSize.toString(), '&page=', _this.pageNumber.toString());
            for (var _a = 0, sort_1 = sort; _a < sort_1.length; _a++) {
                var item = sort_1[_a];
                uri.concat('&sort=', item.path, ',', item.order);
            }
            return _this.http.get(uri, { headers: resource_helper_1.ResourceHelper.headers })
                .map(function (response) { return _this.init(type, response, sort); })
                .catch(function (error) { return Observable_1.Observable.throw(error); });
        };
        // Load page with given size
        this.size = function (type, size) {
            var uri = resource_helper_1.ResourceHelper.getProxy(_this.self_uri).concat('?', 'size=', size.toString());
            for (var _i = 0, _a = _this.sortInfo; _i < _a.length; _i++) {
                var item = _a[_i];
                uri.concat('&sort=', item.path, ',', item.order);
            }
            return _this.http.get(uri, { headers: resource_helper_1.ResourceHelper.headers })
                .map(function (response) { return _this.init(type, response, _this.sortInfo); })
                .catch(function (error) { return Observable_1.Observable.throw(error); });
        };
    }
    return ResourceArray;
}());
exports.ResourceArray = ResourceArray;
//# sourceMappingURL=resource-array.js.map