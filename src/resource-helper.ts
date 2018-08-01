import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Resource} from './resource';
import {ResourceArray} from './resource-array';
import {HalOptions} from './rest.service';
import {SubTypeBuilder} from './subtype-builder';
import {isNullOrUndefined} from 'util';
import * as url from 'url';

export class ResourceHelper {

    private static _headers: HttpHeaders;
    private static proxy_uri: string;
    private static root_uri: string;
    private static http: HttpClient;

    public static get headers(): HttpHeaders {
        if (isNullOrUndefined(this._headers))
            this._headers = new HttpHeaders();
        return this._headers;
    }

    public static set headers(headers: HttpHeaders) {
        this._headers = headers;
    }

    static optionParams(params: HttpParams, options?: HalOptions): HttpParams {
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
                    let sortString = '';
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
            if (!isNullOrUndefined(resource[key])) {
                if (ResourceHelper.className(resource[key])
                    .find((className: string) => className == 'Resource')) {
                    if (resource[key]['_links'])
                        result[key] = resource[key]['_links']['self']['href'];
                } else if (Array.isArray(resource[key])) {
                    let array: any[] = resource[key];
                    if (array) {
                        result[key] = new Array();
                        array.forEach((element) => {
                            if (isPrimitive(element)) {
                                result[key].push(element);
                            }
                            else {
                                result[key].push(this.resolveRelations(element));
                            }
                        });
                    }
                } else {
                    result[key] = resource[key];
                }
            }
        }
        return result as Object;
    }

    static createEmptyResult<T extends Resource>(_embedded: string): ResourceArray<T> {
        let resourceArray: ResourceArray<T> = new ResourceArray<T>();
        resourceArray._embedded = _embedded;
        return resourceArray;
    }

    static getClassName(obj: any): string {
        var funcNameRegex = /function (.+?)\(/;
        var results = (funcNameRegex).exec(obj.constructor.toString());
        return (results && results.length > 1) ? results[1] : '';
    }

    static className(objProto: any): string[] {
        let classNames = [];
        let obj = Object.getPrototypeOf(objProto);
        let className: string;

        while ((className = ResourceHelper.getClassName(obj)) !== 'Object') {
            classNames.push(className);
            obj = Object.getPrototypeOf(obj);
        }

        return classNames;
    }

    static instantiateResourceCollection<T extends Resource>(type: { new(): T }, payload: any,
                                                             result: ResourceArray<T>, builder?: SubTypeBuilder): ResourceArray<T> {
        for (const embeddedClassName of Object.keys(payload[result._embedded])) {
            let embedded: any = payload[result._embedded];
            const items = embedded[embeddedClassName];
            for (let item of items) {
                let instance: T = new type();
                instance = this.searchSubtypes(builder, embeddedClassName, instance);

                this.instantiateResource(instance, item);
                result.push(instance);
            }
        }

        result.totalElements = payload.page ? payload.page.totalElements : result.length;
        result.totalPages = payload.page ? payload.page.totalPages : 1;
        result.pageNumber = payload.page ? payload.page.number : 1;
        result.pageSize = payload.page ? payload.page.size : 20;

        result.self_uri = payload._links && payload._links.self ? payload._links.self.href : undefined;
        result.next_uri = payload._links && payload._links.next ? payload._links.next.href : undefined;
        result.prev_uri = payload._links && payload._links.prev ? payload._links.prev.href : undefined;
        result.first_uri = payload._links && payload._links.first ? payload._links.first.href : undefined;
        result.last_uri = payload._links && payload._links.last ? payload._links.last.href : undefined;
        return result;
    }

    static searchSubtypes<T extends Resource>(builder: SubTypeBuilder, embeddedClassName: string, instance: T) {
        if (builder && builder.subtypes) {
            let keys = builder.subtypes.keys();
            Array.from(keys).forEach((subtypeKey: string) => {
                if (embeddedClassName.toLowerCase().startsWith(subtypeKey.toLowerCase())) {
                    let subtype: { new(): any } = builder.subtypes.get(subtypeKey);
                    instance = new subtype();
                }
            });
        }
        return instance;
    }

    static instantiateResource<T extends Resource>(entity: T, payload: Object): T {
        for (const p in payload) {
            //TODO array init
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
        return ResourceHelper.proxy_uri && ResourceHelper.proxy_uri != '' ?
            ResourceHelper.addSlash(ResourceHelper.proxy_uri) :
            ResourceHelper.addSlash(ResourceHelper.root_uri);
    }

    private static addSlash(uri: string): string {
        let uriParsed = url.parse(uri);
        if (isNullOrUndefined(uriParsed.search) && uri && uri[uri.length - 1] != '/')
            return uri + '/';
        return uri;
    }

    public static getProxy(url: string): string {
        if (!ResourceHelper.proxy_uri || ResourceHelper.proxy_uri == '')
            return url;
        return ResourceHelper.addSlash(url.replace(ResourceHelper.root_uri, ResourceHelper.proxy_uri));
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
}
