"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resource_1 = require("./resource");
var resource_array_1 = require("./resource-array");
var ResourceHelper = (function () {
    function ResourceHelper() {
    }
    Object.defineProperty(ResourceHelper, "headers", {
        get: function () {
            return this._headers;
        },
        set: function (headers) {
            this._headers = headers;
        },
        enumerable: true,
        configurable: true
    });
    ResourceHelper.optionParams = function (params, options) {
        if (options) {
            if (options.params) {
                for (var _i = 0, _a = options.params; _i < _a.length; _i++) {
                    var param = _a[_i];
                    params = params.append(param.key, param.value.toString());
                }
            }
            if (options.size) {
                params = params.append('size', options.size.toString());
            }
            if (options.sort) {
                for (var _b = 0, _c = options.sort; _b < _c.length; _b++) {
                    var s = _c[_b];
                    var sortString = '';
                    sortString = s.path ? sortString.concat(s.path) : sortString;
                    sortString = s.order ? sortString.concat(',').concat(s.order) : sortString;
                    params = params.append('sort', sortString);
                }
            }
        }
        return params;
    };
    ResourceHelper.resolveRelations = function (resource) {
        var result = {};
        for (var key in resource) {
            if (resource[key] instanceof resource_1.Resource) {
                result[key] = resource[key]['_links']['self']['href'];
            }
            else {
                result[key] = resource[key];
            }
        }
        return result;
    };
    ResourceHelper.createEmptyResult = function (http) {
        var result = new resource_array_1.ResourceArray();
        result.http = http;
        return result;
    };
    ResourceHelper.instantiateResourceCollection = function (type, payload, result) {
        var _loop_1 = function (item) {
            var e = new type();
            if (e.subtypes) {
                e.subtypes.forEach(function (subtype) {
                    if (item.startsWith(subtype.name))
                        e = new subtype();
                });
            }
            this_1.instantiateResource(e, item, result['http']);
            result.push(e);
        };
        var this_1 = this;
        for (var _i = 0, _a = payload._embedded[Object.keys(payload['_embedded'])[0]]; _i < _a.length; _i++) {
            var item = _a[_i];
            _loop_1(item);
        }
        result.totalElements = payload.page ? payload.page.totalElements : result.length;
        result.totalPages = payload.page ? payload.page.totalPages : 1;
        result.pageNumber = payload.page ? payload.page.number : 1;
        result.pageSize = payload.page ? payload.page.size : 20;
        result.self_uri = payload._links && payload._links.self ? payload._links.self.href : undefined;
        result.next_uri = payload._links && payload._links.next ? payload._links.next.href : undefined;
        result.prev_uri = payload._links && payload._links.prev ? payload._links.prev.href : undefined;
        result.first_uri = payload._links && payload._links.first ? payload._links.first.href : undefined;
        result.last_uri = payload._links && payload._links.last ? payload._links.last.href : undefined;
        return result;
    };
    ResourceHelper.instantiateResource = function (entity, payload, http) {
        for (var p in payload) {
            entity[p] = payload[p];
        }
        entity.http = http;
        return entity;
    };
    ResourceHelper.setProxyUri = function (proxy_uri) {
        ResourceHelper.proxy_uri = proxy_uri;
    };
    ResourceHelper.setRootUri = function (root_uri) {
        ResourceHelper.root_uri = root_uri;
    };
    ResourceHelper.getURL = function () {
        return ResourceHelper.proxy_uri && ResourceHelper.proxy_uri != '' ?
            ResourceHelper.addSlash(ResourceHelper.proxy_uri) :
            ResourceHelper.addSlash(ResourceHelper.root_uri);
    };
    ResourceHelper.addSlash = function (uri) {
        if (uri && uri[uri.length - 1] != '/')
            return uri + '/';
        return uri;
    };
    ResourceHelper.getProxy = function (url) {
        if (!ResourceHelper.proxy_uri || ResourceHelper.proxy_uri == '')
            return url;
        return ResourceHelper.addSlash(url.replace(ResourceHelper.root_uri, ResourceHelper.proxy_uri));
    };
    return ResourceHelper;
}());
exports.ResourceHelper = ResourceHelper;
//# sourceMappingURL=resource-helper.js.map