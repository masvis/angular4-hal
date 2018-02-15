import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {isNullOrUndefined} from 'util';
import 'rxjs/add/observable/of';

export abstract class Resource {

    public proxyUrl: string;
    public rootUrl: string;

    public http: HttpClient;
    public observable: Observable<any>;
    public _links: any;
    public subtypes: { new(): any }[];

    [index: string]: any;

    constructor(subtypes?: { new(): any }[]) {
        this.subtypes = subtypes;
    }

    // Get collection of related resources
    public getRelationArray<T extends Resource>(type: { new(): T }, relation: string, options?: {
        size?: number, sort?: Sort[],
        params?: [{ key: string, value: string | number }]
    }): Observable<T[]> {

        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
        if (!isNullOrUndefined(this._links)) {
            result.observable = this.http.get(ResourceHelper.getProxy(this._links[relation].href), {
                headers: ResourceHelper.headers,
                params: params
            });
            return result.observable.map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result))
                .map((array: ResourceArray<T>) => array.result);
        } else {
            return Observable.of([]);
        }
    }

    // Get related resource
    public getRelation<T extends Resource>(type: { new(): T }, relation: string): Observable<T> {
        const result: T = new type();
        if (!isNullOrUndefined(this._links)) {
            result.observable = this.http.get(ResourceHelper.getProxy(this._links[relation].href), {headers: ResourceHelper.headers});
            return result.observable.map(data => ResourceHelper.instantiateResource(result, data, this.http));
        } else {
            return Observable.of(null);
        }
    }

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return this.http.post(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return Observable.throw('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            return this.http.patch(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: ResourceHelper.headers});
        } else {
            return Observable.throw('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public substituteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            return this.http.put(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: ResourceHelper.headers});
        } else {
            return Observable.throw('no relation found');
        }
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation(relation: string): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            return this.http.delete(ResourceHelper.getProxy(this._links[relation].href), {headers: ResourceHelper.headers});
        } else {
            return Observable.throw('no relation found');
        }
    }
}