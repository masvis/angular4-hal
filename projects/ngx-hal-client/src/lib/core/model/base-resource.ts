import { Observable, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CacheHelper } from '../cache/cache.helper';
import { ResourceHelper } from '../util/resource-helper';
import { Utils } from '../util/utils';
import { SubTypeBuilder } from './interface/subtype-builder';
import { Resource } from './resource';
import { HttpParams } from '@angular/common/http';
import { CustomEncoder } from '../util/custom-encoder';
import { ResourceArray } from './resource-array';
import uriTemplates from 'uri-templates';
import { HalOptions, LinkOptions } from './common';

export interface Link {
    href: string;
    templated?: boolean;
}

export interface Links {
    [key: string]: Link;
}

export abstract class BaseResource {

    public proxyUrl: string;

    public rootUrl: string;

    public _links: Links;

    // Get related resource
    public getRelation<T extends Resource>(type: { new(): T },
                                           relation: string,
                                           builder?: SubTypeBuilder,
                                           expireMs: number = CacheHelper.defaultExpire,
                                           isCacheActive: boolean = true): Observable<T> {
        let result: T = new type();
        if (this.existRelationLink(relation)) {
            if (CacheHelper.ifPresent(this.getRelationLinkHref(relation), null, null, isCacheActive)) {
                return observableOf(CacheHelper.get<T>(this.getRelationLinkHref(relation)));
            }

            const observable = ResourceHelper.getHttp()
                .get(ResourceHelper.getProxy(this.getRelationLinkHref(relation)),
                    {headers: ResourceHelper.headers});
            return observable.pipe(map((data: any) => {
                if (builder) {
                    for (const embeddedClassName of Object.keys(data._links)) {
                        if (embeddedClassName === 'self') {
                            const href: string = data._links[embeddedClassName].href;
                            const idx: number = href.lastIndexOf('/');
                            const realClassName = href.replace(ResourceHelper.getRootUri(), '').substring(0, idx);
                            result = ResourceHelper.searchSubtypes(builder, realClassName, result);
                            break;
                        }
                    }
                }
                const resource: T = ResourceHelper.instantiateResource(result, data);
                CacheHelper.put(this.getRelationLinkHref(relation), resource, expireMs);
                return resource;
            }));
        } else {
            return observableOf(null);
        }
    }

    public getProjection<T extends Resource>(type: { new(): T },
                                             resource: string,
                                             id: string,
                                             projectionName: string,
                                             expireMs: number = CacheHelper.defaultExpire,
                                             isCacheActive: boolean = true): Observable<T> {
        const uri = this.getResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
        const result: T = new type();

        if (CacheHelper.ifPresent(uri, null, null, isCacheActive)) {
            return observableOf(CacheHelper.get<T>(uri));
        }

        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(data => {
                const filledResource: T = ResourceHelper.instantiateResource(result, data);
                CacheHelper.put(uri, filledResource, expireMs);
                return filledResource;
            }),
            catchError(error => observableThrowError(error))
        );
    }

    // Get collection of related resources
    public getRelationArray<T extends Resource>(type: { new(): T },
                                                relation: string,
                                                options?: HalOptions,
                                                embedded?: string,
                                                builder?: SubTypeBuilder,
                                                expireMs: number = CacheHelper.defaultExpire,
                                                isCacheActive: boolean = true): Observable<T[]> {

        const httpParams = ResourceHelper.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(Utils.isNullOrUndefined(embedded) ? '_embedded' : embedded);
        if (this.existRelationLink(relation)) {
            if (CacheHelper.ifPresent(this.getRelationLinkHref(relation), null, options, isCacheActive)) {
                return observableOf(CacheHelper.getArray(this.getRelationLinkHref(relation)));
            }

            // Use this obj to clear relation url from any http params template because we will pass params in request
            const urlAsObj = new URL(this.getRelationLinkHref(relation));
            const observable = ResourceHelper.getHttp()
                .get(ResourceHelper.getProxy(`${urlAsObj.origin}${urlAsObj.pathname}`), {
                    headers: ResourceHelper.headers,
                    params: httpParams
                });
            return observable
                .pipe(
                    map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result, builder)),
                    catchError(error => observableThrowError(error))
                ).pipe(map((array: ResourceArray<T>) => {
                    CacheHelper.putArray(this.getRelationLinkHref(relation), array.result, expireMs);
                    return array.result;
                }));
        } else {
            return observableOf([]);
        }
    }

    public getProjectionArray<T extends Resource>(type: { new(): T },
                                                  resource: string,
                                                  projectionName: string,
                                                  expireMs: number = CacheHelper.defaultExpire,
                                                  isCacheActive: boolean = true): Observable<T[]> {
        const uri = this.getResourceUrl(resource).concat('?projection=' + projectionName);
        const result: ResourceArray<T> = new ResourceArray<T>('_embedded');

        if (CacheHelper.ifPresent(uri, null, null, isCacheActive)) {
            return observableOf(CacheHelper.getArray(uri));
        }

        const observable = ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result)),
            map((array: ResourceArray<T>) => {
                CacheHelper.putArray(uri, array.result, expireMs);
                return array.result;
            })
        );
    }

    // Adds the given resource to the bound collection by the relation
    public addRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        const header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
        return ResourceHelper.getHttp()
            .put(ResourceHelper.getProxy(this.getRelationLinkHref(relation)),
                resource._links.self.href, {headers: header});
    }

    // Bind the given resource to this resource by the given relation
    public updateRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        const header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');
        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

        return ResourceHelper.getHttp()
            .patch(ResourceHelper.getProxy(this.getRelationLinkHref(relation)),
                resource._links.self.href, {headers: header});
    }

    // Bind the given resource to this resource by the given relation
    public substituteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        const header = ResourceHelper.headers.append('Content-Type', 'text/uri-list');

        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));
        return ResourceHelper.getHttp()
            .put(ResourceHelper.getProxy(this.getRelationLinkHref(relation)),
                resource._links.self.href, {headers: header});
    }

    // Unbind the resource with the given relation from this resource
    public deleteRelation<T extends Resource>(relation: string, resource: T): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        const link: string = resource._links.self.href;
        const idx: number = link.lastIndexOf('/') + 1;

        if (idx === -1) {
            return observableThrowError('no relation found');
        }

        const relationId: string = link.substring(idx);
        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation) + '/' + relationId);

        return ResourceHelper.getHttp()
            .delete(ResourceHelper.getProxy(this.getRelationLinkHref(relation) + '/' + relationId),
                {headers: ResourceHelper.headers});
    }

    // Perform post request for relation with body and url params
    public postRelation(relation: string, body: any, options?: LinkOptions): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        if (!Utils.isNullOrUndefined(options) && !Utils.isNullOrUndefined(options.params)) {
            if (this._links[relation].templated
                && !Utils.isNullOrUndefined(options.strictParams) && options.strictParams) {
                CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

                const uriTemplate = uriTemplates(this._links[relation].href);
                const url = uriTemplate.fillFromObject(options.params);

                return ResourceHelper.getHttp()
                    .post(ResourceHelper.getProxy(url), body)
                    .pipe(
                        map(data => ResourceHelper.instantiateResource(Utils.clone(this), data))
                    );
            }

            const httpParams = ResourceHelper.linkParamsToHttpParams(options.params);
            CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

            return ResourceHelper.getHttp()
                .post(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), body,
                    {
                        params: httpParams
                    }
                )
                .pipe(
                    map(data => ResourceHelper.instantiateResource(Utils.clone(this), data))
                );
        }
        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

        return ResourceHelper.getHttp()
            .post(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), body)
            .pipe(
                map(data => ResourceHelper.instantiateResource(Utils.clone(this), data))
            );
    }

    // Perform patch request for relation with body and url params
    public patchRelation(relation: string, body: any, options?: LinkOptions): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        if (!Utils.isNullOrUndefined(options) && !Utils.isNullOrUndefined(options.params)) {
            if (this._links[relation].templated
                && !Utils.isNullOrUndefined(options.strictParams) && options.strictParams) {
                CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

                const uriTemplate = uriTemplates(this._links[relation].href);
                const url = uriTemplate.fillFromObject(options.params);

                return ResourceHelper.getHttp()
                    .patch(ResourceHelper.getProxy(url), body)
                    .pipe(
                        map(data => ResourceHelper.instantiateResource(Utils.clone(this), data))
                    );
            }

            const httpParams = ResourceHelper.linkParamsToHttpParams(options.params);
            CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

            return ResourceHelper.getHttp()
                .patch(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), body,
                    {
                        params: httpParams
                    }
                )
                .pipe(
                    map(data => ResourceHelper.instantiateResource(Utils.clone(this), data))
                );
        }

        return ResourceHelper.getHttp()
            .patch(ResourceHelper.getProxy(this.getRelationLinkHref(relation)), body)
            .pipe(
                map(data => ResourceHelper.instantiateResource(Utils.clone(this), data))
            );
    }

    protected existRelationLink(relation: string): boolean {
        return !Utils.isNullOrUndefined(this._links) && !Utils.isNullOrUndefined(this._links[relation]);
    }

    protected getRelationLinkHref(relation: string) {
        if (this._links[relation].templated) {
            return ResourceHelper.removeUrlTemplateVars(this._links[relation].href);
        }
        return this._links[relation].href;
    }

    protected getResourceUrl(resource?: string): string {
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

}
