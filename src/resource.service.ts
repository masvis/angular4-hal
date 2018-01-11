import {Resource} from './resource';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ResourceHelper} from './resource-helper';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';

export let API_URI = new InjectionToken('api.uri');

@Injectable()
export class ResourceService {

    constructor(@Inject(API_URI) private root_uri: string, private http: HttpClient) {
    }

    private _headers: HttpHeaders;

    public get headers(): HttpHeaders {
        return this._headers;
    }

    public set headers(headers: HttpHeaders) {
        this._headers = headers;
    }

    public getURL(): string {
        return this.root_uri;
    }

    public getHttp(): HttpClient {
        return this.http;
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
        result.observable = this.http.get(uri, {headers: this.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id);
        const result: T = new type();
        result.observable = this.http.get(uri, {headers: this.headers});
        return result.observable.map(data => ResourceHelper.instantiateResource(result, data, this.http));
    }

    public search<T extends Resource>(type: { new(): T }, query: string,
                                      resource: string,
                                      options?: {
                                          size?: number, sort?: Sort[],
                                          params?: [{ key: string, value: string | number }]
                                      }): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
        result.observable = this.http.get(uri, {headers: this.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public create<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.root_uri.concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.post(uri, payload, {headers: this.headers});
    }

    public update<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.root_uri.concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.put(uri, payload, {headers: this.headers});
    }

    public patch<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.root_uri.concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.patch(uri, payload, {headers: this.headers});
    }

    public delete<T extends Resource>(resource: T): Observable<Object> {
        return this.http.delete(resource._links.self.href, {headers: this.headers});
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
