"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var resource_helper_1 = require("./resource-helper");
var ResourceArray = (function () {
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
        this.init = function (response, sortInfo) {
            var type;
            var result = resource_helper_1.ResourceHelper.createEmptyResult(_this.http);
            result.sortInfo = sortInfo;
            resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result);
            return result;
        };
        // Load next page
        this.next = function () {
            if (_this.next_uri) {
                return _this.http.get(_this.next_uri)
                    .map(function (response) { return _this.init(response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
        };
        this.prev = function () {
            if (_this.prev_uri) {
                return _this.http.get(_this.prev_uri)
                    .map(function (response) { return _this.init(response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
        };
        // Load first page
        this.first = function () {
            if (_this.first_uri) {
                return _this.http.get(_this.first_uri)
                    .map(function (response) { return _this.init(response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
        };
        // Load last page
        this.last = function () {
            if (_this.last_uri) {
                return _this.http.get(_this.last_uri)
                    .map(function (response) { return _this.init(response, _this.sortInfo); })
                    .catch(function (error) { return Observable_1.Observable.throw(error); });
            }
        };
        // Load page with given pageNumber
        this.page = function (id) {
            var uri = _this.self_uri.concat('?', 'size=', _this.pageSize.toString(), '&page=', id.toString());
            for (var _i = 0, _a = _this.sortInfo; _i < _a.length; _i++) {
                var item = _a[_i];
                uri.concat('&sort=', item.path, ',', item.order);
            }
            return _this.http.get(uri)
                .map(function (response) { return _this.init(response, _this.sortInfo); })
                .catch(function (error) { return Observable_1.Observable.throw(error); });
        };
        // Sort collection based on given sort attribute
        this.sortElements = function () {
            var sort = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                sort[_i] = arguments[_i];
            }
            var uri = _this.self_uri.concat('?', 'size=', _this.pageSize.toString(), '&page=', _this.pageNumber.toString());
            for (var _a = 0, sort_1 = sort; _a < sort_1.length; _a++) {
                var item = sort_1[_a];
                uri.concat('&sort=', item.path, ',', item.order);
            }
            return _this.http.get(uri)
                .map(function (response) { return _this.init(response, sort); })
                .catch(function (error) { return Observable_1.Observable.throw(error); });
        };
        // Load page with given size
        this.size = function (size) {
            var uri = _this.self_uri.concat('?', 'size=', size.toString());
            for (var _i = 0, _a = _this.sortInfo; _i < _a.length; _i++) {
                var item = _a[_i];
                uri.concat('&sort=', item.path, ',', item.order);
            }
            return _this.http.get(uri)
                .map(function (response) { return _this.init(response, _this.sortInfo); })
                .catch(function (error) { return Observable_1.Observable.throw(error); });
        };
    }
    return ResourceArray;
}());
exports.ResourceArray = ResourceArray;
//# sourceMappingURL=resource-array.js.map