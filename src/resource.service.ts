import {Observable, throwError as observableThrowError} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Resource} from './resource';
import {ResourceHelper} from './resource-helper';
import {Injectable} from '@angular/core';
import {HttpParams, HttpResponse} from '@angular/common/http';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {ExternalService} from './external.service';
import {HalOptions, HalParam} from './rest.service';
import {SubTypeBuilder} from './subtype-builder';
import {CustomEncoder} from './CustomEncoder';
import * as url from 'url';

@Injectable()
export class ResourceService {
    constructor(private externalService: ExternalService) {
    }

    private static getURL(): string {
        return ResourceHelper.getURL();
    }
    
    private handleError(error: any) {
        return observableThrowError(error);
    }

    public getAll<T extends Resource>(type: { new(): T }, resource: string, _embedded: string, options?: HalOptions, subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource);
        const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

        this.setUrls(result);
        result.sortInfo = options ? options.sort : undefined;
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: params});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => this.handleError(error))
        );
    }

    public get<T extends Resource>(type: { new(): T }, resource: string, id: any, params?: HalParam[], builder?: SubTypeBuilder): Observable<T> {
        let self = this;
        const uri = this.getResourceUrl(resource).concat('/', id);

        let result: T = new type();
        const httpParams = ResourceHelper.params(new HttpParams(), params);

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: httpParams});
        return observable.pipe(
            map((response: HttpResponse<any>) => {
                if(builder) {
                    let linkHref = url.parse(response.body._links.self.href).pathname;
                    let regex = /([A-Za-z0-9]+)\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)/g;
                    let match = regex.exec(linkHref);
                    if (match != null) {
                        let embeddedClassName = match[2];
                        result = ResourceHelper.searchSubtypes(builder, embeddedClassName, result);
                    }
                }
                return ResourceHelper.instantiateResourceFromResponse(result, response);
            }),
            catchError(error => this.handleError(error))
        );
    }

    public getBySelfLink<T extends Resource>(type: { new(): T }, resourceLink: string): Observable<T> {
        const result: T = new type();

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(resourceLink), {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceFromResponse(result, response)),
            catchError(error => this.handleError(error))
        );
    }

    public search<T extends Resource>(type: { new(): T }, query: string, resource: string, _embedded: string, options?: HalOptions,
                                      subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: params});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => this.handleError(error))
        );
    }

    public searchSingle<T extends Resource>(type: { new(): T }, query: string, resource: string, options?: HalOptions): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/search/', query);
        const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: T = new type();

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: params});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceFromResponse(result, response)),
            catchError(error => this.handleError(error))
        );
    }

    public customQuery<T extends Resource>(type: { new(): T }, query: string, resource: string, _embedded: string, options?: HalOptions, subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource + query);
        const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: params});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => this.handleError(error))
        );
    }

    public customQueryPost<T extends Resource>(type: { new(): T }, query: string, resource: string,
                                               _embedded: string, options?: HalOptions, body?: any,
                                               subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.getResourceUrl(resource + query);
        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().post(uri, body, {headers: ResourceHelper.headers, observe: 'response', params: params});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => this.handleError(error))
        );
    }

    public getByRelation<T extends Resource>(type: { new(): T }, resourceLink: string): Observable<T> {
        let result: T = new type();

        this.setUrlsResource(result);
        let observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceFromResponse(result, response)),
            catchError(error => this.handleError(error))
        );
    }

    public getByRelationArray<T extends Resource>(type: { new(): T }, resourceLink: string, _embedded: string, builder?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

        this.setUrls(result);
        let observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceCollection(type, response, result, builder)),
            catchError(error => this.handleError(error))
        );
    }

    public getProjection<T extends Resource>(type: { new(): T }, resource: string, id: string, projectionName: string): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
        const result: T = new type();

        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceFromResponse(result, response)),
            catchError(error => this.handleError(error))
        );
    }

    public getProjectionArray<T extends Resource>(type: { new(): T }, resource: string, projectionName: string): Observable<T[]> {
        const uri = this.getResourceUrl(resource).concat('?projection=' + projectionName);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>('_embedded');

        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response'});
        return observable
            .pipe(
                map((response: HttpResponse<any>) => ResourceHelper.instantiateResourceCollection<T>(type, response, result)),
                catchError(error => this.handleError(error))
            ).pipe(map((resourceArray: ResourceArray<T>) => {
                return resourceArray.result;
            }));
    }

    public count(resource: string, query? : string, options?: HalOptions): Observable<number> {
        const uri = this.getResourceUrl(resource).concat('/search/' + (query === undefined ? 'countAll' : query));
        const params = ResourceHelper.optionParams(new HttpParams(), options);

        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, observe: 'response', params: params}).pipe(
            map((response: HttpResponse<number>) => Number(response.body)),
            catchError(error => this.handleError(error)));
    }

    public create<T extends Resource>(selfResource: string, entity: T) {
        const uri = ResourceHelper.getURL() + selfResource;
        const payload = ResourceHelper.resolveRelations(entity);

        this.setUrlsResource(entity);
        let observable = ResourceHelper.getHttp().post(uri, payload, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207)
                return ResourceHelper.instantiateResourceFromResponse(entity, response);
            else if (response.status == 500) {
                let body: any = response.body;
                return this.handleError(body.error);
            }
        }), catchError(error => this.handleError(error)));
    }

    public update<T extends Resource>(entity: T) {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        this.setUrlsResource(entity);
        let observable = ResourceHelper.getHttp().put(uri, payload, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207)
                return ResourceHelper.instantiateResourceFromResponse(entity, response);
            else if (response.status == 500) {
                let body: any = response.body;
                return this.handleError(body.error);
            }
        }), catchError(error => this.handleError(error)));
    }

    public patch<T extends Resource>(entity: T) {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        const payload = ResourceHelper.resolveRelations(entity);
        this.setUrlsResource(entity);
        let observable = ResourceHelper.getHttp().patch(uri, payload, {headers: ResourceHelper.headers, observe: 'response'});
        return observable.pipe(
            map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207)
                return ResourceHelper.instantiateResourceFromResponse(entity, response);
            else if (response.status == 500) {
                let body: any = response.body;
                return this.handleError(body.error);
            }
        }), catchError(error => this.handleError(error)));
    }

    public delete<T extends Resource>(entity: T): Observable<Object> {
        const uri = ResourceHelper.getProxy(entity._links.self.href);
        return ResourceHelper.getHttp().delete(uri, {headers: ResourceHelper.headers})
            .pipe(catchError(error => this.handleError(error)));
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
