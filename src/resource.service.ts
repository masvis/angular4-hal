import {Resource} from './resource';
import {ResourceHelper} from './resource-helper';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {ExternalService} from './external.service';

@Injectable()
export class ResourceService {

    constructor(private externalService: ExternalService) {
    }

    private static getURL(): string {
        return ResourceHelper.getURL();
    }

    private getHttp(): HttpClient {
        return this.externalService.getHttp();
    }

    public getAll<T extends Resource>(type: { new(): T }, resource: string,
                                      options?: {
                                          size?: number, sort?: Sort[],
                                          params?: [{ key: string, value: string | number }]
                                      }): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.getHttp());

        this.setUrls(result);
        result.sortInfo = options ? options.sort : undefined;
        result.observable = this.getHttp().get(uri, {headers: ResourceHelper.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id);
        const result: T = new type();

        this.setUrlsResource(result);
        result.observable = this.getHttp().get(uri, {headers: ResourceHelper.headers});
        return result.observable.map(data => ResourceHelper.instantiateResource(result, data, this.getHttp()));
    }

    public search<T extends Resource>(type: { new(): T }, query: string,
                                      resource: string,
                                      options?: {
                                          size?: number, sort?: Sort[],
                                          params?: [{ key: string, value: string | number }]
                                      }): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.getHttp());

        this.setUrls(result);
        result.observable = this.getHttp().get(uri, {headers: ResourceHelper.headers, params: params});
        return result.observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result));
    }

    public create<T extends Resource>(selfResource: string, entity: T): Observable<Object> {
        ResourceHelper.getURL() + selfResource
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.getHttp().post(uri, payload, {headers: ResourceHelper.headers});
    }

    public update<T extends Resource>(entity: T): Observable<Object> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.getHttp().put(uri, payload, {headers: ResourceHelper.headers});
    }

    public patch<T extends Resource>(entity: T): Observable<Object> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.getHttp().patch(uri, payload, {headers: ResourceHelper.headers});
    }

    public delete<T extends Resource>(entity: T): Observable<Object> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        return this.getHttp().delete(uri, {headers: ResourceHelper.headers});
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
        let url = ResourceService.getURL();
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }
        return url;
    }

    private setUrls<T extends Resource>(result: ResourceArray<T>) {
        result.proxyUrl = this.externalService.proxy_uri;
        result.rootUrl = this.externalService.root_uri;
    }

    private setUrlsResource<T extends Resource>(result: T) {
        result.proxyUrl = this.externalService.proxy_uri;
        result.rootUrl = this.externalService.root_uri;
    }
}
