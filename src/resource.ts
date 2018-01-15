import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';

export abstract class Resource {

    public proxyUrl: string;
    public rootUrl: string;

    static path: string;
    public http: HttpClient;
    public observable: Observable<any>;
    public _links: any;
    [index: string]: any;

    constructor() {
    }

    // Get collection of related resources
    public getRelationArray<T extends Resource>(type: { new(): T }, relation: string, options?: {
        size?: number, sort?: Sort[],
        params?: [{ key: string, value: string | number }]
    }): Observable<T[]> {

        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
        result.observable = this.http.get(ResourceHelper.getProxy(this._links[relation].href), {headers: ResourceHelper.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result))
            .map((array: ResourceArray<T>) => array.result);
    }

    // Get related resource
    public getRelation<T extends Resource>(type: { new(): T }, relation: string): Observable<T> {
        const result: T = new type();
        result.observable = this.http.get(ResourceHelper.getProxy(this._links.relation.href), {headers: ResourceHelper.headers});
        return result.observable.map(data => ResourceHelper.instantiateResource(result, data, this.http));
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(resource: T): Observable<any> {
        return this.http.put(ResourceHelper.getProxy(this._links.relation.href), resource._links.self.href, {headers: ResourceHelper.headers});
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation(relation: string): Observable<any> {
        return this.http.delete(ResourceHelper.getProxy(this._links.relation.href), {headers: ResourceHelper.headers});
    }

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list')
        return this.http.post(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
    }
}