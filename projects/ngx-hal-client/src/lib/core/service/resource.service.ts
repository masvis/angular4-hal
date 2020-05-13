import { HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { catchError, map } from 'rxjs/operators';
import { CacheHelper } from '../cache/cache.helper';
import { Sort } from '../model/interface/sort';
import { SubTypeBuilder } from '../model/interface/subtype-builder';
import { Resource } from '../model/resource';
import { ResourceArray } from '../model/resource-array';
import { CustomEncoder } from '../util/custom-encoder';
import { ResourceHelper } from '../util/resource-helper';
import { ExternalService } from './external.service';
import { HalOptions, HalParam, Include, ResourceOptions } from '../model/common';

@Injectable()
export class ResourceService {

    constructor(private externalService: ExternalService) {
    }

    private static getURL(): string {
        return ResourceHelper.getURL();
    }

    public getAll<T extends Resource>(type: { new(): T },
                                      resource: string,
                                      embedded: string,
                                      options?: HalOptions,
                                      subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource);
        const httpParams = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        this.setUrls(result);
        result.sortInfo = options ? options.sort : undefined;
        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: httpParams});
        return observable.pipe(
            map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any, params?: HalParam[]): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id);
        const result: T = new type();
        const httpParams = ResourceHelper.params(new HttpParams(), params);

        this.setUrlsResource(result);
        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: httpParams});
        return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error)));
    }

    public getBySelfLink<T extends Resource>(type: { new(): T }, resourceLink: string): Observable<T> {
        const result: T = new type();

        this.setUrlsResource(result);
        const observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(resourceLink), {headers: ResourceHelper.headers});
        return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error)));
    }

    public search<T extends Resource>(type: { new(): T }, query: string, resource: string, embedded: string, options?: HalOptions,
                                      subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const httpParams = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        this.setUrls(result);
        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: httpParams});
        return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public searchSingle<T extends Resource>(type: { new(): T }, query: string, resource: string, options?: HalOptions): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const httpParams = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: T = new type();

        this.setUrlsResource(result);
        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: httpParams});
        return observable.pipe(map(response => ResourceHelper.instantiateResource(result, response)),
            catchError(error => observableThrowError(error)));
    }

    public customQuery<T extends Resource>(type: { new(): T },
                                           query: string,
                                           resource: string,
                                           embedded: string,
                                           options?: HalOptions,
                                           subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource + query);
        const httpParams = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        this.setUrls(result);
        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params: httpParams});
        return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public customQueryPost<T extends Resource>(type: { new(): T }, query: string, resource: string,
                                               embedded: string, options?: HalOptions, body?: any,
                                               subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource + query);
        const httpParams = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        this.setUrls(result);
        const observable = ResourceHelper.getHttp().post(uri, body, {headers: ResourceHelper.headers, params: httpParams});
        return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public getByRelation<T extends Resource>(type: { new(): T }, resourceLink: string): Observable<T> {
        const result: T = new type();

        this.setUrlsResource(result);
        const observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers});
        return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error)));
    }

    public getByRelationArray<T extends Resource>(type: { new(): T },
                                                  resourceLink: string,
                                                  embedded: string,
                                                  builder?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        this.setUrls(result);
        const observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(response => ResourceHelper.instantiateResourceCollection(type, response, result, builder)),
            catchError(error => observableThrowError(error))
        );
    }

    public getProjection<T extends Resource>(type: { new(): T },
                                             resource: string,
                                             id: string,
                                             projectionName: string): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
        const result: T = new type();

        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error))
        );
    }

    public getProjectionArray<T extends Resource>(type: { new(): T },
                                                  resource: string,
                                                  projectionName: string): Observable<T[]> {
        const uri = this.getResourceUrl(resource).concat('?projection=' + projectionName);
        const result: ResourceArray<T> = new ResourceArray<T>('_embedded');

        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable
            .pipe(
                map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result)),
                catchError(error => observableThrowError(error))
            ).pipe(map((resourceArray: ResourceArray<T>) => {
                return resourceArray.result;
            }));
    }

    public count(resource: string, query?: string, options?: HalOptions): Observable<number> {
        const uri = this.getResourceUrl(resource).concat('/search/' + (query === undefined ? 'countAll' : query));
        const httpParams = ResourceHelper.optionParams(new HttpParams(), options);

        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: httpParams}).pipe(
            map((response: HttpResponse<number>) => Number(response.body)),
            catchError(error => observableThrowError(error)));
    }

    public create<T extends Resource>(selfResource: string, entity: T) {
        const uri = ResourceHelper.getURL() + selfResource;
        const payload = ResourceHelper.resolveRelations(entity);

        this.setUrlsResource(entity);
        const observable = ResourceHelper.getHttp().post(uri, payload, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207) {
                return ResourceHelper.instantiateResource(entity, response.body);
            } else if (response.status === 500) {
                const body: any = response.body;
                return observableThrowError(body.error);
            }
        }), catchError(error => observableThrowError(error)));
    }

    public update<T extends Resource>(entity: T) {
        CacheHelper.evictEntityLinks(entity);
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        this.setUrlsResource(entity);
        const observable = ResourceHelper.getHttp().put(uri, payload, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207) {
                return ResourceHelper.instantiateResource(entity, response.body);
            } else if (response.status === 500) {
                const body: any = response.body;
                return observableThrowError(body.error);
            }
        }), catchError(error => observableThrowError(error)));
    }

    public patch<T extends Resource>(entity: T, options?: Array<ResourceOptions> | Include) {
        CacheHelper.evictEntityLinks(entity);
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity, options);
        this.setUrlsResource(entity);
        const observable = ResourceHelper.getHttp().patch(uri, payload, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207) {
                return ResourceHelper.instantiateResource(entity, response.body);
            } else if (response.status === 500) {
                const body: any = response.body;
                return observableThrowError(body.error);
            }
        }), catchError(error => observableThrowError(error)));
    }

    public delete<T extends Resource>(entity: T): Observable<object> {
        CacheHelper.evictEntityLinks(entity);
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        return ResourceHelper.getHttp()
            .delete(uri, {headers: ResourceHelper.headers})
            .pipe(catchError(error => observableThrowError(error)));
    }

    public hasNext<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.nextUri !== undefined;
    }

    public hasPrev<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.prevUri !== undefined;
    }

    public hasFirst<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.firstUri !== undefined;
    }

    public hasLast<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.lastUri !== undefined;
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

    public sortElements<T extends Resource>(resourceArray: ResourceArray<T>,
                                            type: { new(): T },
                                            ...sort: Sort[]): Observable<ResourceArray<T>> {
        return resourceArray.sortElements(type, ...sort);
    }

    public size<T extends Resource>(resourceArray: ResourceArray<T>, type: { new(): T }, size: number): Observable<ResourceArray<T>> {
        return resourceArray.size(type, size);
    }

    private getResourceUrl(resource?: string): string {
        let url: string = ResourceService.getURL();
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }

        url = url.replace('{?projection}', '');
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
