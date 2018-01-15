"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var http_1 = require("@angular/common/http");
var resource_helper_1 = require("./resource-helper");
var Resource = /** @class */ (function () {
    function Resource() {
    }
    Resource.prototype.getURL = function (url) {
        if (!this.proxyUrl)
            return url;
        return url.replace(this.rootUrl, this.proxyUrl);
    };
    // Get collection of related resources
    Resource.prototype.getRelationArray = function (type, relation, options) {
        var params = resource_helper_1.ResourceHelper.optionParams(new http_1.HttpParams(), options);
        var result = resource_helper_1.ResourceHelper.createEmptyResult(this.http);
        result.observable = this.http.get(this.getURL(this._links[relation].href), { headers: resource_helper_1.ResourceHelper.headers, params: params });
        return result.observable.map(function (response) { return resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result); })
            .map(function (array) { return array.result; });
    };
    // Get related resource
    Resource.prototype.getRelation = function (type, relation) {
        var _this = this;
        var result = new type();
        result.observable = this.http.get(this.getURL(this._links.relation.href), { headers: resource_helper_1.ResourceHelper.headers });
        return result.observable.map(function (data) { return resource_helper_1.ResourceHelper.instantiateResource(result, data, _this.http); });
    };
    // Bind the given resource to this resource by the given relation
    Resource.prototype.updateRelation = function (resource) {
        return this.http.put(this.getURL(this._links.relation.href), resource._links.self.href, { headers: resource_helper_1.ResourceHelper.headers });
    };
    // Unbind the resource with the given relation from this resource
    Resource.prototype.deleteRelation = function (relation) {
        return this.http.delete(this.getURL(this._links.relation.href), { headers: resource_helper_1.ResourceHelper.headers });
    };
    // Adds the given resource to the bound collection by the relation
    Resource.prototype.addRelation = function (relation, resource) {
        var header = resource_helper_1.ResourceHelper.headers.append('Content-Type', 'text/uri-list');
        return this.http.post(this.getURL(this._links[relation].href), resource._links.self.href, { headers: header });
    };
    return Resource;
}());
exports.Resource = Resource;
//# sourceMappingURL=resource.js.map