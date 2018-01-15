import {Resource} from './resource';
import {ResourceHelper} from './resource-helper';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';

export let API_URI = new InjectionToken('api.uri');
export let PROXY_URI = new InjectionToken('proxy.uri');

@Injectable()
export class ResourceService {

    constructor(@Inject(API_URI) private root_uri: string,
                @Inject(PROXY_URI) private proxy_uri: string,
                private http: HttpClient) {
    }

    public getURL(): string {
        return this.proxy_uri ? this.proxy_uri : this.root_uri;
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

        this.setUrls(result);
        result.sortInfo = options ? options.sort : undefined;
        result.observable = this.http.get(uri, {headers: ResourceHelper.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id);
        const result: T = new type();

        this.setUrlsResource(result);
        result.observable = this.http.get(uri, {headers: ResourceHelper.headers});
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

        this.setUrls(result);
        result.observable = this.http.get(uri, {headers: ResourceHelper.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public create<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.getURL().concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.post(uri, payload, {headers: ResourceHelper.headers});
    }

    public update<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.getURL().concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.put(uri, payload, {headers: ResourceHelper.headers});
    }

    public patch<T extends Resource>(entity: T): Observable<Object> {
        const uri = this.getURL().concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.patch(uri, payload, {headers: ResourceHelper.headers});
    }

    public delete<T extends Resource>(resource: T): Observable<Object> {
        return this.http.delete(resource._links.self.href, {headers: ResourceHelper.headers});
    }

    public hasNext<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.next_uri != undefined;
    }

    public hasPrev<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.prev_uri != undefined;
    }

    public hasFirst<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.first_uri != undefined;
    }

    public hasLast<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.last_uri != undefined;
    }

    public next<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }): Observable<ResourceArray<T>> {
        return resourceArray.next(type);
    }

    public prev<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }): Observable<ResourceArray<T>> {
        return resourceArray.prev(type);
    }

    public first<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }): Observable<ResourceArray<T>> {
        return resourceArray.first(type);
    }

    public last<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }): Observable<ResourceArray<T>> {
        return resourceArray.last(type);
    }

    public page<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }, id: number): Observable<ResourceArray<T>> {
        return resourceArray.page(type, id);
    }

    public sortElements<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }, ...sort: Sort[]): Observable<ResourceArray<T>> {
        return resourceArray.sortElements(type, ...sort);
    }

    public size<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }, size: number): Observable<ResourceArray<T>> {
        return resourceArray.size(type, size);
    }

    private getResourceUrl(resource?: string): string {
        let url = this.getURL();
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }
        return url;
    }

    private setUrls<T extends Resource>(result: ResourceArray<T>) {
        result.proxyUrl = this.proxy_uri;
        result.rootUrl = this.root_uri;
    }

    private setUrlsResource<T extends Resource>(result: T) {
        result.proxyUrl = this.proxy_uri;
        result.rootUrl = this.root_uri;
    }
}
