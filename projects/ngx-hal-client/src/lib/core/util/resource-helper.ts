import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseResource } from '../model/base-resource';
import { SubTypeBuilder } from '../model/interface/subtype-builder';
import { Resource } from '../model/resource';
import { ResourceArray } from '../model/resource-array';
import { Utils } from './utils';
import { HalOptions, HalParam, Include, LinkParams, ResourceOptions } from '../model/common';

export class ResourceHelper {

    private static readonly URL_TEMPLATE_VAR_REGEXP = /{[^}]*}/g;
    private static readonly EMPTY_STRING = '';

    private static embeddedResourceType: new() => BaseResource;

    private static _headers: HttpHeaders;
    private static proxyUri: string;
    private static rootUri: string;
    private static http: HttpClient;

    public static withEmbeddedResourceType(type: new() => BaseResource) {
        this.embeddedResourceType = type;
    }

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
                const paramValue = this.isResource(param.value)
                    ? param.value.getSelfLinkHref()
                    : param.value.toString();
                httpParams = httpParams.append(param.key, paramValue);
            }
        }

        return httpParams;
    }

    static linkParamsToHttpParams(params?: LinkParams) {
        let httpParams = new HttpParams();
        if (params) {
            for (const param in params) {
                if (params.hasOwnProperty(param)) {
                    httpParams = httpParams.append(param, params[param]);
                }
            }
        }

        return httpParams;
    }

    static resolveRelations(resource: Resource, options?: Array<ResourceOptions> | Include): object {
        const result: any = {};
        for (const key in resource) {
            if (resource[key] == null && options) {
                if (Array.isArray(options)) {
                    options.forEach(option => {
                        if (Include.NULL_VALUES === option?.include) {
                            if (Array.isArray(option.props)) {
                                if (option.props.includes(key)) {
                                    result[key] = null;
                                }
                            }
                        }
                    });
                } else {
                    result[key] = null;
                }
            } else if (!Utils.isNullOrUndefined(resource[key])) {
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
                            } else if (ResourceHelper.className(element)
                                .find((className: string) => className === 'Resource') || element._links) {
                                result[key].push(element._links.self.href);
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

    static getClassName(obj: any): string {
        const funcNameRegex = /function (.+?)\(/;
        const results = (funcNameRegex).exec(obj.constructor.toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    static className(objProto: any): string[] {
        const classNames = [];
        let obj = Object.getPrototypeOf(objProto);

        while (ResourceHelper.getClassName(obj) !== 'Object') {
            classNames.push(ResourceHelper.getClassName(obj));
            obj = Object.getPrototypeOf(obj);
        }

        return classNames;
    }

    static instantiateResourceCollection<T extends Resource>(type: { new(): T }, payload: any,
                                                             result: ResourceArray<T>, builder?: SubTypeBuilder): ResourceArray<T> {
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

        result.selfUri = payload._links && payload._links.self ? payload._links.self.href : undefined;
        result.nextUri = payload._links && payload._links.next ? payload._links.next.href : undefined;
        result.prevUri = payload._links && payload._links.prev ? payload._links.prev.href : undefined;
        result.firstUri = payload._links && payload._links.first ? payload._links.first.href : undefined;
        result.lastUri = payload._links && payload._links.last ? payload._links.last.href : undefined;
        return result;
    }

    static searchSubtypes<T extends Resource>(builder: SubTypeBuilder, embeddedClassName: string, instance: T) {
        if (builder && builder.subtypes) {
            const keys = builder.subtypes.keys();
            Array.from(keys).forEach((subtypeKey: string) => {
                if (embeddedClassName.toLowerCase().startsWith(subtypeKey.toLowerCase())) {
                    const subtype: { new(): any } = builder.subtypes.get(subtypeKey);
                    instance = new subtype();
                }
            });
        }
        return instance;
    }

    static instantiateResource<T extends BaseResource>(entity: T, payload: any): T {
        if (Utils.isNullOrUndefined(payload)) {
            return payload;
        }
        for (const key of Object.keys(payload)) {
            if (payload[key] instanceof Array) {
                for (let i = 0; i < payload[key].length; i++) {
                    if (this.isEmbeddedResource(payload[key][i]) && this.embeddedResourceType) {
                        payload[key][i] = ResourceHelper.createResource(new this.embeddedResourceType(), payload[key][i]);
                    }
                }
            } else if (this.isEmbeddedResource(payload[key]) && this.embeddedResourceType) {
                payload[key] = ResourceHelper.createResource(new this.embeddedResourceType(), payload[key]);
            }
        }

        return ResourceHelper.createResource(entity, payload);
    }

    private static createResource<T extends BaseResource>(entity: T, payload: any): T {
        for (const p in payload) {
            entity[p] = payload[p];
        }
        return entity;
    }

    private static isEmbeddedResource(object: any) {
        // Embedded resource doesn't have self link in _links array

        return (object !== null && typeof object === 'object') && ('_links' in object) && !('self' in object['_links']);
    }

    private static isResource(value: Resource | string | number | boolean): value is Resource {
        return (value as Resource).getSelfLinkHref !== undefined
            && typeof (value as Resource).getSelfLinkHref === 'function';
    }

    static setProxyUri(proxyUri: string) {
        ResourceHelper.proxyUri = proxyUri;
    }

    static setRootUri(rootUri: string) {
        ResourceHelper.rootUri = rootUri;
    }

    public static getURL(): string {
        return ResourceHelper.proxyUri && ResourceHelper.proxyUri !== '' ?
            ResourceHelper.addSlash(ResourceHelper.proxyUri) :
            ResourceHelper.addSlash(ResourceHelper.rootUri);
    }

    private static addSlash(uri: string): string {
        const uriParsed = new URL(uri);
        if ((Utils.isNullOrUndefined(uriParsed.search) || uriParsed.search === '') && uri && uri[uri.length - 1] !== '/') {
            return uri + '/';
        }
        return uri;
    }

    public static getProxy(scrUrl: string): string {
        if (!ResourceHelper.proxyUri || ResourceHelper.proxyUri === '') {
            return ResourceHelper.removeUrlTemplateVars(scrUrl);
        }
        return ResourceHelper.addSlash(
            ResourceHelper.removeUrlTemplateVars(scrUrl)
                .replace(ResourceHelper.rootUri, ResourceHelper.proxyUri));
    }

    public static removeUrlTemplateVars(srcUrl: string) {
        return srcUrl.replace(ResourceHelper.URL_TEMPLATE_VAR_REGEXP, ResourceHelper.EMPTY_STRING);
    }

    public static setHttp(http: HttpClient) {
        this.http = http;
    }

    public static getHttp(): HttpClient {
        return this.http;
    }

    static getRootUri() {
        return this.rootUri;
    }
}
