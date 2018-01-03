import {Resource} from './resource';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ResourceHelper} from './resource-helper';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

export let API_URI = new InjectionToken('api.uri');

@Injectable()
export class ResourceService {

    constructor(@Inject(API_URI) private root_uri: string, private http: HttpClient) {
    }

  getAll<R extends Resource>(type: { new(): R }, resource: string, options?: { size?: number, sort?: Sort[], params?: [{ key: string, value: string | number }] }): R[] {
      const uri = this.getResourceUrl(resource);
    const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: R[] = ResourceHelper.createEmptyResult<R>(this.http);
    result.sortInfo = options ? options.sort : undefined;
        result.observable = this.http.get(uri, {params: params});
        result.observable.subscribe(response => ResourceHelper.instantiateResourceCollection(type, response, result));
        return result;
    }

    get <R extends Resource>(type: { new(): R }, resource: string, id: any): R {
      const uri = this.getResourceUrl(resource).concat('/', id);
        const result: R = new type();
        result.observable = this.http.get(uri);
        result.observable.subscribe(data => {
            ResourceHelper.instantiateResource(result, data, this.http);
        });
        return result;
    }

  search<R extends Resource>(type: { new(): R }, query: string, options?: { size?: number, sort?: Sort[], params?: [{ key: string, value: string | number }] }): R[] {
      const uri = this.getResourceUrl().concat('search/', query);
    const params = ResourceHelper.optionParams(new HttpParams(), options);
    const result: R[] = ResourceHelper.createEmptyResult<R>(this.http);
        result.observable = this.http.get(uri, {params: params});
        result.observable.subscribe(response => ResourceHelper.instantiateResourceCollection(type, response, result));
        return result;
    }

    create<R extends Resource>(entity: R): Observable<Object> {
        const uri = this.root_uri.concat(entity.path);
        const payload = ResourceHelper.resolveRelations(entity);
        return this.http.post(uri, payload);
    }

    delete<R extends Resource>(resource: R): Observable<Object> {
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
