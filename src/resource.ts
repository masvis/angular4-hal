import {of as observableOf, throwError as observableThrowError} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {ResourceArray} from './resource-array';

import {HalOptions} from './rest.service';
import {SubTypeBuilder} from './subtype-builder';
import {Injectable} from '@angular/core';
import {CustomEncoder} from './CustomEncoder';
import {Utils} from './Utils';
import {Observable} from 'rxjs/internal/Observable';
import {CacheHelper} from './cache/cache.helper';

export type Link = { href: string, templated?: boolean };
export type Links = { [key: string]: Link };

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

        const params = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(Utils.isNullOrUndefined(_embedded) ? '_embedded' : _embedded);
        if (this.existRelationLink(relation)) {
            if (CacheHelper.ifPresent(this.getRelationLinkHref(relation)))
                return observableOf(CacheHelper.getArray(this.getRelationLinkHref(relation)));

            let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), {
                headers: ResourceHelper.headers,
                params: params
            });
            return observable
                .pipe(
                    map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result, builder)),
                    catchError(error => observableThrowError(error))
                ).pipe(map((array: ResourceArray<T>) => {
                    CacheHelper.putArray(this.getRelationLinkHref(relation), array.result, 0);
                    return array.result;
                }));
        } else {
            return observableOf([]);
        }
    }

    public getProjection<T extends Resource>(type: { new(): T }, resource: string, id: string, projectionName: string): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
        const result: T = new type();

        if (CacheHelper.ifPresent(uri))
            return observableOf(CacheHelper.get(uri));

        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(data => {
                let resource: T = ResourceHelper.instantiateResource(result, data);
                CacheHelper.put(uri, resource, 0);
                return resource;
            }),
            catchError(error => observableThrowError(error))
        );
    }

    public getProjectionArray<T extends Resource>(type: { new(): T }, resource: string, projectionName: string): Observable<T[]> {
        const uri = this.getResourceUrl(resource).concat('?projection=' + projectionName);
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>('_embedded');

        if (CacheHelper.ifPresent(uri))
            return observableOf(CacheHelper.getArray(uri));

        let observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result)),
            map((array: ResourceArray<T>) => {
                CacheHelper.putArray(uri, array.result, 0);
                return array.result;
            })
        );
    }

    private getResourceUrl(resource?: string): string {
        let url = ResourceHelper.getURL();
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }

        url = url.replace('{?projection}', '');
        return url;
    }

    // Get related resource
    public getRelation<T extends Resource>(type: { new(): T }, relation: string, builder?: SubTypeBuilder): Observable<T> {
        let result: T = new type();
        if (this.existRelationLink(relation)) {

            if (CacheHelper.ifPresent(this.getRelationLinkHref(relation)))
                return observableOf(CacheHelper.get(this.getRelationLinkHref(relation)));

            let observable = ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), {headers: ResourceHelper.headers});
            return observable.pipe(map((data: any) => {
                if (builder) {
                    for (const embeddedClassName of Object.keys(data['_links'])) {
                        if (embeddedClassName == 'self') {
                            let href: string = data._links[embeddedClassName].href;
                            let idx: number = href.lastIndexOf('/');
                            let realClassName = href.replace(ResourceHelper.getRootUri(), '').substring(0, idx);
                            result = ResourceHelper.searchSubtypes(builder, realClassName, result);
                            break;
                        }
                    }
                }
                let resource: T = ResourceHelper.instantiateResource(result, data);
                CacheHelper.put(this.getRelationLinkHref(relation), resource, 0);
                return resource;
            }));
        } else {
            return observableOf(null);
        }
    }

    private getRelationLinkHref(relation: string) {
        if (this._links[relation].templated)
            return this._links[relation].href.replace('{?projection}', '');
        return this._links[relation].href;
    }

    private existRelationLink(relation: string): boolean {
        return !Utils.isNullOrUndefined(this._links) && !Utils.isNullOrUndefined(this._links[relation]);
    }

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (this.existRelationLink(relation)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().put(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), resource._links.self.href, {headers: header});
        } else {
            return observableThrowError('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (this.existRelationLink(relation)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().patch(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), resource._links.self.href, {headers: header});
        } else {
            return observableThrowError('no relation found');
        }
    }

    // Bind the given resource to this resource by the given relation
    public substituteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (this.existRelationLink(relation)) {
            let header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
            return ResourceHelper.getHttp().put(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), resource._links.self.href, {headers: header});
        } else {
            return observableThrowError('no relation found');
        }
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (this.existRelationLink(relation)) {
            let link: string = resource._links['self'].href;
            let idx: number = link.lastIndexOf('/') + 1;

            if (idx == -1)
                return observableThrowError('no relation found');

            let relationId: string = link.substring(idx);
            return ResourceHelper.getHttp().delete(ResourceHelper.getProxy(this.getRelationLinkHref(relation) + '/' + relationId), {headers: ResourceHelper.headers});
        } else {
            return observableThrowError('no relation found');
        }
    }
}
