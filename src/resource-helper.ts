import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Resource} from './resource';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';

export class ResourceHelper {

    private static _headers: HttpHeaders;

    public static get headers(): HttpHeaders {
        return this._headers;
    }

    public static set headers(headers: HttpHeaders) {
        this._headers = headers;
    }

  static optionParams(params: HttpParams, options?: { size?: number, sort?: Sort[], params?: [{ key: string, value: string | number }] }): HttpParams {
    if (options) {

      if (options.params) {
        for (const param of options.params) {
          params = params.append(param.key, param.value.toString());
        }
        }

      if (options.size) {
        params = params.append('size', options.size.toString());
      }

      if (options.sort) {
        for (const s of options.sort) {
          let sortString = "";
          sortString = s.path ? sortString.concat(s.path) : sortString;
          sortString = s.order ? sortString.concat(',').concat(s.order) : sortString;
          params = params.append('sort', sortString);
        }
      }

    }
    return params;
    }

    static resolveRelations(resource: Resource): Object {
        const result: any = {};
        for (const key in resource) {
            if (resource[key] instanceof Resource) {
                result[key] = resource[key]['_links']['self']['href'];
            } else {
                result[key] = resource[key];
            }
        }
        return result as Object;
    }

    static createEmptyResult<T extends Resource>(http: HttpClient): ResourceArray<T> {
        const result: ResourceArray<T> = new ResourceArray();
        result.http = http;
        return result;
    }

    static instantiateResourceCollection<T extends Resource>(type: { new(): T }, payload: any, result: ResourceArray<T>): ResourceArray<T> {
        for (const item  of payload._embedded [Object.keys(payload['_embedded'])[0]]) {
            const e: T = new type();
            this.instantiateResource(e, item, result['http']);
            result.push(e);
        }

        result.totalElements = payload.page ? payload.page.totalElements : result.length;
        result.totalPages = payload.page ? payload.page.totalPages : 1;
        result.pageNumber = payload.page ? payload.page.number : 1;
        result.pageSize = payload.page ? payload.page.size : 20;

        result.self_uri = payload._links.self ? payload._links.self.href : undefined;
        result.next_uri = payload._links.next ? payload._links.next.href : undefined;
        result.prev_uri = payload._links.prev ? payload._links.prev.href : undefined;
        result.first_uri = payload._links.first ? payload._links.first.href : undefined;
        result.last_uri = payload._links.last ? payload._links.last.href : undefined;
        return result;
    }

    static instantiateResource<T extends Resource>(entity: T, payload: Object, http: HttpClient): T {
        for (const p in payload) {
            entity[p] = payload[p];
        }
        entity.http = http;
        return entity;
    }
}
