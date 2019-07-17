/* tslint:disable:variable-name max-line-length */
import {throwError as observableThrowError} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Resource} from './resource';
import {ResourceHelper} from './resourceHelper';
import {Injectable} from '@angular/core';
import {HttpParams, HttpResponse} from '@angular/common/http';
import {Sort} from './sort';
import {ResourceArray} from './resourceArray';
import {ExternalService} from './external.service';
import {HalOptions, HalParam} from './rest.service';
import {SubtypeBuilder} from './subtypeBuilder';
import {Observable} from 'rxjs/internal/Observable';
import {CustomEncoder} from './customEncoder';
import * as url from 'url';

@Injectable()
export class ResourceService {

  constructor(private externalService: ExternalService) {
  }

  private static getURL(): string {
    return ResourceHelper.getURL();
  }

  public getAll<T extends Resource>(type: new() => T, resource: string, _embedded: string, options?: HalOptions, subType?: SubtypeBuilder): Observable<ResourceArray<T>> {
    const uri = this.getResourceUrl(resource);
    const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

    this.setUrls(result);
    result.sortInfo = options ? options.sort : undefined;
    const observable = ResourceHelper.getHttp().get(uri, {
      headers: ResourceHelper.headers,
      observe: 'response',
      params
    });
    return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
      catchError(error => observableThrowError(error)));
  }

  public get<T extends Resource>(type: new() => T, resource: string, id: any, params?: HalParam[], builder?: SubtypeBuilder): Observable<T> {
    const self = this;
    const uri = this.getResourceUrl(resource).concat('/', id);

    let result: T = new type();
    const httpParams = ResourceHelper.params(new HttpParams(), params);

    this.setUrlsResource(result);
    const observable = ResourceHelper.getHttp().get(uri, {
      headers: ResourceHelper.headers,
      observe: 'response',
      params: httpParams
    });
    return observable.pipe(
      map((response: HttpResponse<any>) => {
        if (builder) {
          const linkHref = url.parse(response.body._links.self.href).pathname;
          const regex = /([A-Za-z0-9]+)\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)/g;
          const match = regex.exec(linkHref);
          if (match != null) {
            const embeddedClassName = match[2];
            result = ResourceHelper.searchSubtypes(builder, embeddedClassName, result);
          }
        }
        return ResourceHelper.instantiateResourceFromResponse(result, response);
      }),
      catchError(error => observableThrowError(error))
    );
  }

  public getBySelfLink<T extends Resource>(type: new() => T, resourceLink: string): Observable<T> {
    const result: T = new type();

    this.setUrlsResource(result);
    const observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(resourceLink), {headers: ResourceHelper.headers});
    return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
      catchError(error => observableThrowError(error)));
  }

  public search<T extends Resource>(type: new() => T, query: string, resource: string, _embedded: string, options?: HalOptions,
                                    subType?: SubtypeBuilder): Observable<ResourceArray<T>> {
    const uri = this.getResourceUrl(resource).concat('/search/', query);
    const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

    this.setUrls(result);
    const observable = ResourceHelper.getHttp().get(uri, {
      headers: ResourceHelper.headers,
      observe: 'response',
      params
    });
    return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
      catchError(error => observableThrowError(error)));
  }

  public searchSingle<T extends Resource>(type: new() => T, query: string, resource: string, options?: HalOptions): Observable<T> {
    const uri = this.getResourceUrl(resource).concat('/search/', query);
    const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
    const result: T = new type();

    this.setUrlsResource(result);
    const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers, params});
    return observable.pipe(map(response => ResourceHelper.instantiateResource(result, response)),
      catchError(error => observableThrowError(error)));
  }

  public customQuery<T extends Resource>(type: new() => T, query: string, resource: string, _embedded: string, options?: HalOptions, subType?: SubtypeBuilder): Observable<ResourceArray<T>> {
    const uri = this.getResourceUrl(resource + query);
    const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

    this.setUrls(result);
    const observable = ResourceHelper.getHttp().get(uri, {
      headers: ResourceHelper.headers,
      observe: 'response',
      params
    });
    return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
      catchError(error => observableThrowError(error)));
  }

  public customQueryPost<T extends Resource>(type: new() => T, query: string, resource: string,
                                             _embedded: string, options?: HalOptions, body?: any,
                                             subType?: SubtypeBuilder): Observable<ResourceArray<T>> {
    const uri = this.getResourceUrl(resource + query);
    const params = ResourceHelper.optionParams(new HttpParams(), options);
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

    this.setUrls(result);
    const observable = ResourceHelper.getHttp().post(uri, body, {
      headers: ResourceHelper.headers,
      observe: 'response',
      params
    });
    return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
      catchError(error => observableThrowError(error)));
  }

  public getByRelation<T extends Resource>(type: new() => T, resourceLink: string): Observable<T> {
    const result: T = new type();

    this.setUrlsResource(result);
    const observable = ResourceHelper.getHttp().get(resourceLink, {headers: ResourceHelper.headers});
    return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
      catchError(error => observableThrowError(error)));
  }

  public getByRelationArray<T extends Resource>(type: new() => T, resourceLink: string, _embedded: string, builder?: SubtypeBuilder): Observable<ResourceArray<T>> {
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(_embedded);

    this.setUrls(result);
    const observable = ResourceHelper.getHttp().get(resourceLink, {
      headers: ResourceHelper.headers,
      observe: 'response'
    });
    return observable.pipe(
      map(response => ResourceHelper.instantiateResourceCollection(type, response, result, builder)),
      catchError(error => observableThrowError(error))
    );
  }

  public getProjection<T extends Resource>(type: new() => T, resource: string, id: string, projectionName: string): Observable<T> {
    const uri = this.getResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
    const result: T = new type();

    const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
    return observable.pipe(
      map(data => ResourceHelper.instantiateResource(result, data)),
      catchError(error => observableThrowError(error))
    );
  }

  public getProjectionArray<T extends Resource>(type: new() => T, resource: string, projectionName: string): Observable<T[]> {
    const uri = this.getResourceUrl(resource).concat('?projection=' + projectionName);
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>('_embedded');

    const observable = ResourceHelper.getHttp().get(uri, {
      headers: ResourceHelper.headers,
      observe: 'response'
    });
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
    const params = ResourceHelper.optionParams(new HttpParams(), options);

    return ResourceHelper.getHttp().get(uri, {
      headers: ResourceHelper.headers,
      observe: 'response',
      params
    }).pipe(
      map((response: HttpResponse<number>) => Number(response.body)),
      catchError(error => observableThrowError(error)));
  }

  public create<T extends Resource>(selfResource: string, entity: T) {
    const uri = ResourceHelper.getURL() + selfResource;
    const payload = ResourceHelper.resolveRelations(entity);

    this.setUrlsResource(entity);
    const observable = ResourceHelper.getHttp().post(uri, payload, {
      headers: ResourceHelper.headers,
      observe: 'response'
    });
    return observable.pipe(map((response: HttpResponse<object>) => {
      if (response.status >= 200 && response.status <= 207) {
        return ResourceHelper.instantiateResource(entity, response.body);
      } else if (response.status === 500) {
        const body: any = response.body;
        return observableThrowError(body.error);
      }
    }), catchError(error => observableThrowError(error)));
  }

  public update<T extends Resource>(entity: T) {
    const uri = ResourceHelper.getProxy(entity._links.self.href);
    const payload = ResourceHelper.resolveRelations(entity);
    this.setUrlsResource(entity);
    const observable = ResourceHelper.getHttp().put(uri, payload, {
      headers: ResourceHelper.headers,
      observe: 'response'
    });
    return observable.pipe(map((response: HttpResponse<object>) => {
      if (response.status >= 200 && response.status <= 207) {
        return ResourceHelper.instantiateResource(entity, response.body);
      } else if (response.status === 500) {
        const body: any = response.body;
        return observableThrowError(body.error);
      }
    }), catchError(error => observableThrowError(error)));
  }

  public patch<T extends Resource>(entity: T) {
    const uri = ResourceHelper.getProxy(entity._links.self.href);
    const payload = ResourceHelper.resolveRelations(entity);
    this.setUrlsResource(entity);
    const observable = ResourceHelper.getHttp().patch(uri, payload, {
      headers: ResourceHelper.headers,
      observe: 'response'
    });
    return observable.pipe(map((response: HttpResponse<object>) => {
      if (response.status >= 200 && response.status <= 207) {
        return ResourceHelper.instantiateResource(entity, response.body);
      } else if (response.status === 500) {
        const body: any = response.body;
        return observableThrowError(body.error);
      }
    }), catchError(error => observableThrowError(error)));
  }

  public delete<T extends Resource>(entity: T): Observable<object> {
    const uri = ResourceHelper.getProxy(entity._links.self.href);
    return ResourceHelper.getHttp().delete(uri, {headers: ResourceHelper.headers}).pipe(catchError(error => observableThrowError(error)));
  }

  public hasNext<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
    return resourceArray.next_uri !== undefined;
  }

  public hasPrev<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
    return resourceArray.prev_uri !== undefined;
  }

  public hasFirst<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
    return resourceArray.first_uri !== undefined;
  }

  public hasLast<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
    return resourceArray.last_uri !== undefined;
  }

  public next<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
    return resourceArray.next(type);
  }

  public prev<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
    return resourceArray.prev(type);
  }

  public first<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
    return resourceArray.first(type);
  }

  public last<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
    return resourceArray.last(type);
  }

  public page<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T, id: number): Observable<ResourceArray<T>> {
    return resourceArray.page(type, id);
  }

  public sortElements<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T, ...sort: Sort[]): Observable<ResourceArray<T>> {
    return resourceArray.sortElements(type, ...sort);
  }

  public size<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T, size: number): Observable<ResourceArray<T>> {
    return resourceArray.size(type, size);
  }

  private getResourceUrl(resource?: string): string {
    let resourceUrl: string = ResourceService.getURL();
    if (!resourceUrl.endsWith('/')) {
      resourceUrl = resourceUrl.concat('/');
    }
    if (resource) {
      return resourceUrl.concat(resource);
    }

    resourceUrl = resourceUrl.replace(/({.+})/i, '');
    return resourceUrl;
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
