import {Resource} from './resource';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ResourceHelper} from './resource-helper';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';

export let API_URI = new InjectionToken('api.uri');

@Injectable()
export class ResourceService {

    constructor(@Inject(API_URI) protected root_uri: string, protected http: HttpClient) {
    }

    public getAll<T extends Resource>(type: { new(): T }, resource: string,
                               options?: {
                                   size?: number, sort?: Sort[],
                                   params?: [{ key: string, value: string | number }]
                               }): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
        result.sortInfo = options ? options.sort : undefined;
        result.observable = this.http.get(uri, {params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id);
        const result: T = new type();
        result.observable = this.http.get(uri);
        return result.observable.map(data => ResourceHelper.instantiateResource(result, data, this.http));
    }

    public search<T extends Resource>(type: { new(): T }, query: string,
                               options?: {
                                   size?: number, sort?: Sort[],
                                   params?: [{ key: string, value: string | number }]
                               }): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl().concat('search/', query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
        result.observable = this.http.get(uri, {params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public create<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.root_uri.concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.post(uri, payload);
    }

    public delete<T extends Resource>(resource: T): Observable<Object> {
        return this.http.delete(resource._links.self.href);
    }

    private getResourceUrl(resource?: string): string {
        let url = this.root_uri;
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }
        return url;
    }
}
