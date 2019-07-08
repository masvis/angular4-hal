/* tslint:disable:variable-name */
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Resource} from './resource';
import {ResourceArray} from './resourceArray';
import {HalOptions, HalParam} from './rest.service';
import {SubtypeBuilder} from './subtypeBuilder';
import * as url from 'url';
import {Utils} from './utils';

export interface ResourceExpire<T extends Resource> {
  entity: any;
  expire: number;
}

// @dynamic
export class ResourceHelper {

  private static proxy_uri: string;
  private static root_uri: string;
  private static http: HttpClient;

  private static _headers: HttpHeaders;

  public static get headers(): HttpHeaders {
    if (Utils.isNullOrUndefined(this._headers)) {
      this._headers = new HttpHeaders();
    }
    return this._headers;
  }

  public static set headers(headers: HttpHeaders) {
    this._headers = headers;
  }

  static optionParams(params: HttpParams, options?: HalOptions): HttpParams {
    if (options) {

      params = this.params(params, options.params);

      if (options.size) {
        params = params.append('size', options.size.toString());
      }

      if (options.sort) {
        for (const s of options.sort) {
          let sortString = '';
          sortString = s.path ? sortString.concat(s.path) : sortString;
          sortString = s.order ? sortString.concat(',').concat(s.order) : sortString;
          params = params.append('sort', sortString);
        }
      }

    }
    return params;
  }

  static params(httpParams: HttpParams, params?: HalParam[]) {
    if (params) {
      for (const param of params) {
        httpParams = httpParams.append(param.key, param.value.toString());
      }
    }

    return httpParams;
  }

  static resolveRelations(resource: Resource): object {
    const result: any = {};
    for (const key in resource) {
      if (!Utils.isNullOrUndefined(resource[key])) {
        if (ResourceHelper.className(resource[key])
          .find((className: string) => className === 'Resource') || resource[key]._links) {
          if (resource[key]._links) {
            result[key] = resource[key]._links.self.href;
          }
        } else if (Array.isArray(resource[key])) {
          const array: any[] = resource[key];
          if (array) {
            result[key] = [];
            array.forEach((element) => {
              if (Utils.isPrimitive(element)) {
                result[key].push(element);
              } else {
                result[key].push(this.resolveRelations(element));
              }
            });
          }
        } else {
          result[key] = resource[key];
        }
      }
    }
    return result as object;
  }

  static createEmptyResult<T extends Resource>(_embedded: string): ResourceArray<T> {
    const resourceArray: ResourceArray<T> = new ResourceArray<T>();
    resourceArray._embedded = _embedded;
    return resourceArray;
  }

  static getClassName(obj: any): string {
    const funcNameRegex = /function (.+?)\(/;
    const results = (funcNameRegex).exec(obj.constructor.toString());
    return (results && results.length > 1) ? results[1] : '';
  }

  static className(objProto: any): string[] {
    const classNames = [];
    let obj = Object.getPrototypeOf(objProto);
    let className: string;

    // tslint:disable-next-line:no-conditional-assignment
    while ((className = ResourceHelper.getClassName(obj)) !== 'Object') {
      classNames.push(className);
      obj = Object.getPrototypeOf(obj);
    }

    return classNames;
  }

  static instantiateResourceFromResponse<T extends Resource>(entity: T, response: HttpResponse<any>): T {
    if (response.status >= 200 && response.status <= 207) {
      return ResourceHelper.instantiateResource(entity, response.body);
    } else if (response.status === 404) {
      return null;
    }
  }

  static instantiateResourceCollection<T extends Resource>(type: new() => T, response: HttpResponse<any>,
                                                           result: ResourceArray<T>, builder?: SubtypeBuilder): ResourceArray<T> {

    if (response.status >= 200 && response.status <= 207) {
      const payload = response.body;
      if (payload[result._embedded]) {
        for (const embeddedClassName of Object.keys(payload[result._embedded])) {
          const embedded: any = payload[result._embedded];
          const items = embedded[embeddedClassName];
          for (const item of items) {
            let instance: T = new type();
            instance = this.searchSubtypes(builder, embeddedClassName, instance);

            this.instantiateResource(instance, item);
            result.push(instance);
          }
        }
      }

      result.totalElements = payload.page ? payload.page.totalElements : result.length;
      result.totalPages = payload.page ? payload.page.totalPages : 1;
      result.pageNumber = payload.page ? payload.page.number : 1;
      result.pageSize = payload.page ? payload.page.size : 20;

      result.self_uri = payload._links && payload._links.self ? payload._links.self.href : undefined;
      result.next_uri = payload._links && payload._links.next ? payload._links.next.href : undefined; // tslint:disable-line:max-line-length
      result.prev_uri = payload._links && payload._links.prev ? payload._links.prev.href : undefined; // tslint:disable-line:max-line-length
      result.first_uri = payload._links && payload._links.first ? payload._links.first.href : undefined; // tslint:disable-line:max-line-length
      result.last_uri = payload._links && payload._links.last ? payload._links.last.href : undefined; // tslint:disable-line:max-line-length
    } else if (response.status === 404) {
      result.result = [];
    }
    return result;
  }

  static searchSubtypes<T extends Resource>(builder: SubtypeBuilder, embeddedClassName: string, instance: T) {
    if (builder && builder.subtypes) {
      const keys = builder.subtypes.keys();
      Array.from(keys).forEach((subtypeKey: string) => {
        if (embeddedClassName.toLowerCase().startsWith(subtypeKey.toLowerCase())) {
          const subtype: new() => any = builder.subtypes.get(subtypeKey);
          instance = new subtype();
        }
      });
    }
    return instance;
  }

  static instantiateResource<T extends Resource>(entity: T, payload: object): T {
    for (const p of Object.keys(payload)) {
      // TODO array initClearCacheProcess
      /* if(entity[p].constructor === Array && isNullOrUndefined(payload[p]))
           entity[p] = [];
       else*/
      entity[p] = payload[p];
    }
    return entity;
  }

  static setProxyUri(proxy_uri: string) {
    ResourceHelper.proxy_uri = proxy_uri;
  }

  static setRootUri(root_uri: string) {
    ResourceHelper.root_uri = root_uri;
  }

  public static getURL(): string {
    return ResourceHelper.proxy_uri && ResourceHelper.proxy_uri !== '' ?
      ResourceHelper.addSlash(ResourceHelper.proxy_uri) :
      ResourceHelper.addSlash(ResourceHelper.root_uri);
  }

  public static getProxy(uri: string): string {
    uri = uri.replace('{?projection}', '');
    if (!ResourceHelper.proxy_uri || ResourceHelper.proxy_uri === '') {
      return uri;
    }
    return ResourceHelper.addSlash(uri.replace(ResourceHelper.root_uri, ResourceHelper.proxy_uri));
  }

  public static setHttp(http: HttpClient) {
    this.http = http;
  }

  public static getHttp(): HttpClient {
    return this.http;
  }

  static getRootUri() {
    return this.root_uri;
  }

  private static addSlash(uri: string): string {
    const uriParsed = url.parse(uri);
    if (Utils.isNullOrUndefined(uriParsed.search) && uri && uri[uri.length - 1] !== '/') {
      return uri + '/';
    }
    return uri;
  }
}
