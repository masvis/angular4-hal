import {Resource} from './resource';
import {ResourceHelper} from './resource-helper';
import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {ExternalService} from './external.service';
import {HalOptions} from './rest.service';

@Injectable()
export class ResourceService {

    constructor(private externalService: ExternalService) {
    }

    private static getURL(): string {
        return ResourceHelper.getURL();
    }

    public getAll<T extends Resource>(type: { new(): T }, resource: string, options?: HalOptions): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>();

        this.setUrls(result);
        result.sortInfo = options ? options.sort : undefined;
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: params});
        return observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result))
            .catch(error => Observable.throw(error));
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id);
        const result: T = new type();

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable.map(data => ResourceHelper.instantiateResource(result, data))
            .catch(error => Observable.throw(error));
    }

    public search<T extends Resource>(type: { new(): T }, query: string, resource: string, options?: HalOptions): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>();

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: params});
        return observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result))
            .catch(error => Observable.throw(error));
    }

    public searchSingle<T extends Resource>(type: { new(): T }, query: string, resource: string, options?: HalOptions): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: T = new type();

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: params});
        return observable.map(response => ResourceHelper.instantiateResource(result, response))
            .catch(error => Observable.throw(error));
    }

    public customQuery<T extends Resource>(type: { new(): T }, query: string, resource: string, options?: HalOptions): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource + query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>();

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: params});
        return observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result))
            .catch(error => Observable.throw(error));
    }

    public getByRelation<T extends Resource>(type: { new(): T }, resourceLink: string): Observable<T> {
        const result: T = new type();

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers});
        return observable.map(data => ResourceHelper.instantiateResource(result, data))
            .catch(error => Observable.throw(error));
    }

    public getByRelationArray<T extends Resource>(type: { new(): T }, resourceLink: string): Observable<ResourceArray<T>> {
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>();

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers});
        return observable.map(response => ResourceHelper.instantiateResourceCollection(type, response, result))
            .catch(error => Observable.throw(error));
    }

    public count(resource: string): Observable<number> {
        const uri = this.getResourceUrl(resource).concat('/search/countAll');

        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'body'})
            .map((response: Response) => Number(response.body))
            .catch(error => Observable.throw(error));
    }

    public create<T extends Resource>(selfResource: string, entity: T): Observable<T> {
        const uri = ResourceHelper.getURL() + selfResource;
        const payload = ResourceHelper.resolveRelations(entity);
        return ResourceHelper.getHttp().post(uri, payload, {headers: ResourceHelper.headers})
            .catch(error => Observable.throw(error));
    }

    public update<T extends Resource>(entity: T): Observable<T> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        return ResourceHelper.getHttp().put(uri, payload, {headers: ResourceHelper.headers})
            .catch(error => Observable.throw(error));
    }

    public patch<T extends Resource>(entity: T): Observable<T> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        return ResourceHelper.getHttp().patch(uri, payload, {headers: ResourceHelper.headers})
            .catch(error => Observable.throw(error));
    }

    public delete<T extends Resource>(entity: T): Observable<Object> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        return ResourceHelper.getHttp().delete(uri, {headers: ResourceHelper.headers})
            .catch(error => Observable.throw(error));
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
        result.proxyUrl = this.externalService.getProxyUri();
        result.rootUrl = this.externalService.getRootUri();
    }

    private setUrlsResource<T extends Resource>(result: T) {
        result.proxyUrl = this.externalService.getProxyUri();
        result.rootUrl = this.externalService.getRootUri();
    }
}
