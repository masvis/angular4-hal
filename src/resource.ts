
import {throwError as observableThrowError, of as observableOf} from 'rxjs';

import {map} from 'rxjs/operators';


import {HttpParams} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {ResourceArray} from './resource-array';
import {isNullOrUndefined} from 'util';

import {HalOptions} from './rest.service';
import {SubTypeBuilder} from './subtype-builder';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';

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
    public getRelationArray<T extends Resource>(type: { new(): T }, relation: string, _embedded?: string, options?: HalOptions, builder?: SubTypeBuilder): Observable<T[]> {

        const params = ResourceHelper.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(isNullOrUndefined(_embedded) ? "_embedded" : _embedded);
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(this._links[relation])) {
            let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(this._links[relation].href), {
                headers: ResourceHelper.headers,
                params: params
            });
            return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result, builder)),
                map((array: ResourceArray<T>) => array.result),);
        } else {
            return observableOf([]);
        }
    }

    // Get related resource
    public getRelation<T extends Resource>(type: { new(): T }, relation: string, builder?: SubTypeBuilder): Observable<T> {
        let result: T = new type();
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(this._links[relation])) {
            let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(this._links[relation].href), {headers: ResourceHelper.headers});
            return observable.pipe(map((data: any) => {
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
            }));
        } else {
            return observableOf(null);
        }
    }

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(this._links[relation])) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().put(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return observableThrowError('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(this._links[relation])) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().patch(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return observableThrowError('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public substituteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(this._links[relation])) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().put(ResourceHelper.getProxy(this._links[relation].href), resource._links.self.href, {headers: header});
        } else {
            return observableThrowError('no relation found');
        }
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!isNullOrUndefined(this._links) && !isNullOrUndefined(resource._links)) {
            let link: string = resource._links['self'].href;
            let idx: number = link.lastIndexOf('/') + 1;

            if (idx == -1)
                return observableThrowError('no relation found');

            let relationId: string = link.substring(idx);
            return ResourceHelper.getHttp().delete(ResourceHelper.getProxy(this._links[relation].href + '/' + relationId), {headers: ResourceHelper.headers});
        } else {
            return observableThrowError('no relation found');
        }
    }
}