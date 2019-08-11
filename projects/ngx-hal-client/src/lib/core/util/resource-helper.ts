import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as url from 'url';
import { SubTypeBuilder } from '../model/interface/subtype-builder';
import { Resource } from '../model/resource';
import { ResourceArray } from '../model/resource-array';
import { HalOptions, HalParam, LinkParams } from '../service/rest.service';
import { Utils } from './utils';

export interface ResourceExpire<T extends Resource> {
    entity: any;
    expire: number;
}

export class ResourceHelper {

    private static readonly URL_TEMPLATE_VAR_REGEXP = /{[^}]*}/g;
    private static readonly EMPTY_STRING = '';

    private static _headers: HttpHeaders;
    private static proxyUri: string;
    private static rootUri: string;
    private static http: HttpClient;

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

    static createEmptyResult<T extends Resource>(embedded: string): ResourceArray<T> {
        const resourceArray: ResourceArray<T> = new ResourceArray<T>();
        resourceArray._embedded = embedded;
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

    static instantiateResource<T extends Resource>(entity: T, payload: any): T {
        for (const p in payload) {
            // TODO array initClearCacheProcess
            /* if(entity[p].constructor === Array && isNullOrUndefined(payload[p]))
                 entity[p] = [];
             else*/
            entity[p] = payload[p];
        }
        return entity;
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
        const uriParsed = url.parse(uri);
        if (Utils.isNullOrUndefined(uriParsed.search) && uri && uri[uri.length - 1] !== '/') {
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

    public static getUrlTemplateVars(srcUrl: string) {
        if (ResourceHelper.URL_TEMPLATE_VAR_REGEXP.test(srcUrl)) {
            return srcUrl.match(ResourceHelper.URL_TEMPLATE_VAR_REGEXP)[0]
                .replace('{?', '')
                .replace('}', '')
                .split(',');
        }

        return [];
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
