"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var http_1 = require("@angular/common/http");
var resource_helper_1 = require("./resource-helper");
var util_1 = require("util");
require("rxjs/add/observable/of");
var Resource = /** @class */ (function () {
    function Resource(subtypes) {
        this.subtypes = subtypes;
    }
    // Get collection of related resources
    Resource.prototype.getRelationArray = function (type, relation, options) {
        var params = resource_helper_1.ResourceHelper.optionParams(new http_1.HttpParams(), options);
        var result = resource_helper_1.ResourceHelper.createEmptyResult(this.http);
        if (!util_1.isNullOrUndefined(this._links)) {
            result.observable = this.http.get(resource_helper_1.ResourceHelper.getProxy(this._links[relation].href), {
                headers: resource_helper_1.ResourceHelper.headers,
                params: params
            });
            return result.observable.map(function (response) { return resource_helper_1.ResourceHelper.instantiateResourceCollection(type, response, result); })
                .map(function (array) { return array.result; });
        }
        else {
            return Observable_1.Observable.of([]);
        }
    };
    // Get related resource
    Resource.prototype.getRelation = function (type, relation) {
        var _this = this;
        var result = new type();
        if (!util_1.isNullOrUndefined(this._links)) {
            result.observable = this.http.get(resource_helper_1.ResourceHelper.getProxy(this._links[relation].href), { headers: resource_helper_1.ResourceHelper.headers });
            return result.observable.map(function (data) { return resource_helper_1.ResourceHelper.instantiateResource(result, data, _this.http); });
        }
        else {
            return Observable_1.Observable.of(null);
        }
    };
    // Adds the given resource to the bound collection by the relation
    Resource.prototype.addRelation = function (relation, resource) {
        if (!util_1.isNullOrUndefined(this._links)) {
            var header = resource_helper_1.ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return this.http.post(resource_helper_1.ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, { headers: header });
        }
        else {
            return Observable_1.Observable.throw('no relation found');
        }
    };
    // Bind the given resource to this resource by the given relation
    Resource.prototype.updateRelation = function (relation, resource) {
        if (!util_1.isNullOrUndefined(this._links)) {
            return this.http.patch(resource_helper_1.ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, { headers: resource_helper_1.ResourceHelper.headers });
        }
        else {
            return Observable_1.Observable.throw('no relation found');
        }
    };
    // Bind the given resource to this resource by the given relation
    Resource.prototype.substituteRelation = function (relation, resource) {
        if (!util_1.isNullOrUndefined(this._links)) {
            return this.http.put(resource_helper_1.ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, { headers: resource_helper_1.ResourceHelper.headers });
        }
        else {
            return Observable_1.Observable.throw('no relation found');
        }
    };
    // Unbind the resource with the given relation from this resource
    Resource.prototype.deleteRelation = function (relation) {
        if (!util_1.isNullOrUndefined(this._links)) {
            return this.http.delete(resource_helper_1.ResourceHelper.getProxy(this._links[relation].href), { headers: resource_helper_1.ResourceHelper.headers });
        }
        else {
            return Observable_1.Observable.throw('no relation found');
        }
    };
    return Resource;
}());
exports.Resource = Resource;
//# sourceMappingURL=resource.js.map