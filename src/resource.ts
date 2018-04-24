import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {HttpParams} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {ResourceArray} from './resource-array';
import {isNullOrUndefined} from 'util';
import 'rxjs/add/observable/of';
import {HalOptions} from './rest.service';
import {SubTypeBuilder} from './subtype-builder';
import {Injectable} from '@angular/core';

@Injectable()
export abstract class Resource {

    public proxyUrl: string;
    public rootUrl: string;

    public _links: any;
    public _subtypes: Map<string, any>;

    public get subtypes(): Map<string, any> {
        return this._subtypes;
    }

    public set subtypes(_subtypes: Map<string, any>) {
        this._subtypes = _subtypes;
    }

    constructor() {
    }

    // Get collection of related resources
    public getRelationArray<T extends Resource>(type: { new(): T }, relation: string, options?: HalOptions, builder?: SubTypeBuilder): Observable<T[]> {

        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>();
        if (!isNullOrUndefined(this._links)) {
            let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(this._links[relation].href), {
                headers: ResourceHelper.headers,
                params: params
            });
            return observable.map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result, builder))
                .map((array: ResourceArray<T>) => array.result);
        } else {
            return Observable.of([]);
        }
    }

    // Get related resource
    public getRelation<T extends Resource>(type: { new(): T }, relation: string, builder?: SubTypeBuilder): Observable<T> {
        let result: T = new type();
        if (!isNullOrUndefined(this._links)) {
            let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(this._links[relation].href), {headers: ResourceHelper.headers});
            return observable.map((data: any) => {
                if (builder) {
                    for (const embeddedClassName of Object.keys(data['_links'])) {
                        if (embeddedClassName == 'self') {
                            let href: string = data._links[embeddedClassName].href;
                            let idx: number = href.lastIndexOf('/');
                            let realClassName = href.replace(ResourceHelper.getRootUri(), "").substring(0, idx);
                            result = ResourceHelper.searchSubtypes(builder, realClassName, result);
                            break;
                        }
                    }
                }
                return ResourceHelper.instantiateResource(result, data);
            });
        } else {
            return Observable.of(null);
        }
    }

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().put(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return Observable.throw('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().patch(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return Observable.throw('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public substituteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().put(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return Observable.throw('no relation found');
        }
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(resource._links)) {
            let link: string = resource._links['self'].href;
            let idx: number = link.lastIndexOf('/') + 1;

            if (idx == -1)
                return Observable.throw('no relation found');

            let relationId: string = link.substring(idx);
            return ResourceHelper.getHttp().delete(ResourceHelper.getProxy(this._links[relation].href + '/' + relationId), {headers: ResourceHelper.headers});
        } else {
            return Observable.throw('no relation found');
        }
    }
}