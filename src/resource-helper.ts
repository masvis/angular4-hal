import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Resource} from './resource';
import {ResourceArray} from './resource-array';
import {HalOptions} from './rest.service';

export class ResourceHelper {

    private static _headers: HttpHeaders;
    private static proxy_uri: string;
    private static root_uri: string;
    private static http: HttpClient;

    public static get headers(): HttpHeaders {
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
            if (resource[key] instanceof Resource) {
                result[key] = resource[key]['_links']['self']['href'];
            } else {
                result[key] = resource[key];
            }
        }
        return result as Object;
    }

    static createEmptyResult<T extends Resource>(): ResourceArray<T> {
        return new ResourceArray();
    }

    static getClassName(obj: any): string {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(obj.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    static className(objProto: any): string[] {
        let classNames = [];
        let obj = Object.getPrototypeOf(objProto);
        let className: string;

        while ((className = ResourceHelper.getClassName(obj)) !== "Object") {
            classNames.push(className);
            obj = Object.getPrototypeOf(obj);
        }

        return classNames;
    }

    static instantiateResourceCollection<T extends Resource>(type: { new(): T }, payload: any, result: ResourceArray<T>): ResourceArray<T> {
        for (const key of Object.keys(payload['_embedded'])) {
            const items = payload._embedded[key];
            for (let item of items) {
                let e: T = new type();
                if (e.subtypes) {
                    let keys = e.subtypes.keys();
                    keys.next((subtypeKey: string) => {
                        if (key.toLowerCase().startsWith(subtypeKey.toLowerCase())) {
                            let subtype: { new(): any } = e.subtypes.get(subtypeKey);
                            e = new subtype();
                        }
                    });
                }

                this.instantiateResource(e, item);
                result.push(e);
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

    static instantiateResource<T extends Resource>(entity: T, payload: Object): T {
        for (const p in payload) {
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
        if (uri && uri[uri.length - 1] != '/')
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
}
