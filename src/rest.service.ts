import {of as observableOf, throwError as observableThrowError, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {Resource} from './resource';
import {ResourceArray} from './resource-array';
import {Sort} from './sort';
import {ResourceService} from './resource.service';
import {SubTypeBuilder} from './subtype-builder';
import {Injector} from '@angular/core';
import {Utils} from './Utils';

export type HalParam = { key: string, value: string | number | boolean };
export type HalOptions = { notPaged?: boolean, size?: number, sort?: Sort[], params?: HalParam[] };

export class RestService<T extends Resource> {
    private type: any;
    private resource: string;
    public resourceArray: ResourceArray<T>;
    private resourceService: ResourceService;

    private _embedded: string = '_embedded';

    constructor(type: { new(): T },
                resource: string,
                private injector: Injector,
                _embedded?: string) {
        this.type = type;
        this.resource = resource;
        this.resourceService = injector.get(ResourceService);
        if (!Utils.isNullOrUndefined(_embedded))
            this._embedded = _embedded;
    }

    protected handleError(error: any): Observable<never> {
        return RestService.handleError(error);
    }

    protected static handleError(error: any): Observable<never> {
        return observableThrowError(error);
    }

    public getAll(options?: HalOptions, subType?: SubTypeBuilder): Observable<T[]> {
        return this.resourceService.getAll(this.type, this.resource, this._embedded, options, subType).pipe(
            mergeMap((resourceArray: ResourceArray<T>) => {
                if (options && options.notPaged && !Utils.isNullOrUndefined(resourceArray.first_uri)) {
                    options.notPaged = false;
                    options.size = resourceArray.totalElements;
                    return this.getAll(options);
                } else {
                    this.resourceArray = resourceArray;
                    return observableOf(resourceArray.result);
                }
            }));
    }

    public get(id: any, params?: HalParam[], builder?: SubTypeBuilder): Observable<T> {
        return this.resourceService.get(this.type, this.resource, id, params, builder);
    }

    public getBySelfLink(selfLink: string): Observable<T> {
        return this.resourceService.getBySelfLink(this.type, selfLink);
    }

    public search(query: string, options?: HalOptions, subType?: SubTypeBuilder): Observable<T[]> {
        return this.resourceService.search(this.type, query, this.resource, this._embedded, options, subType).pipe(
            mergeMap((resourceArray: ResourceArray<T>) => {
                if (options && options.notPaged && !Utils.isNullOrUndefined(resourceArray.first_uri)) {
                    options.notPaged = false;
                    options.size = resourceArray.totalElements;
                    return this.search(query, options, subType);
                } else {
                    this.resourceArray = resourceArray;
                    return observableOf(resourceArray.result);
                }
            }));
    }

    public searchSingle(query: string, options?: HalOptions): Observable<T> {
        return this.resourceService.searchSingle(this.type, query, this.resource, options);
    }

    public customQuery(query: string, options?: HalOptions, subType?: SubTypeBuilder): Observable<T[]> {
        return this.resourceService.customQuery(this.type, query, this.resource, this._embedded, options, subType).pipe(
            mergeMap((resourceArray: ResourceArray<T>) => {
                if (options && options.notPaged && !Utils.isNullOrUndefined(resourceArray.first_uri)) {
                    options.notPaged = false;
                    options.size = resourceArray.totalElements;
                    return this.customQuery(query, options, subType);
                } else {
                    this.resourceArray = resourceArray;
                    return observableOf(resourceArray.result);
                }
            }));
    }

    public customQueryPost(query: string, options?: HalOptions, body?: any, subType?: SubTypeBuilder): Observable<T[]> {
        return this.resourceService.customQueryPost(this.type, query, this.resource, this._embedded, options, body, subType).pipe(
            mergeMap((resourceArray: ResourceArray<T>) => {
                if (options && options.notPaged && !Utils.isNullOrUndefined(resourceArray.first_uri)) {
                    options.notPaged = false;
                    options.size = resourceArray.totalElements;
                    return this.customQueryPost(query, options, body, subType);
                } else {
                    this.resourceArray = resourceArray;
                    return observableOf(resourceArray.result);
                }
            }));
    }

    public getByRelationArray(relation: string, builder?: SubTypeBuilder): Observable<T[]> {
        return this.resourceService.getByRelationArray(this.type, relation, this._embedded, builder).pipe(
            map((resourceArray: ResourceArray<T>) => {
                this.resourceArray = resourceArray;
                return resourceArray.result;
            }));
    }

    public getByRelation(relation: string): Observable<T> {
        return this.resourceService.getByRelation(this.type, relation);
    }

    public count(query?: string, options?: HalOptions): Observable<number> {
        return this.resourceService.count(this.resource, query, options);
    }

    public create(entity: T) {
        return this.resourceService.create(this.resource, entity);
    }

    public update(entity: T) {
        return this.resourceService.update(entity);
    }

    public patch(entity: T) {
        return this.resourceService.patch(entity);
    }

    public delete(entity: T): Observable<Object> {
        return this.resourceService.delete(entity);
    }

    public totalElement(): number {
        if (this.resourceArray && this.resourceArray.totalElements)
            return this.resourceArray.totalElements;
        return 0;
    }

    public totalPages(): number {
        if (this.resourceArray && this.resourceArray.totalPages)
            return this.resourceArray.totalPages;
        return 1;
    }

    public hasFirst(): boolean {
        if (this.resourceArray)
            return this.resourceService.hasFirst(this.resourceArray);
        return false;
    }

    public hasNext(): boolean {
        if (this.resourceArray)
            return this.resourceService.hasNext(this.resourceArray);
        return false;
    }

    public hasPrev(): boolean {
        if (this.resourceArray)
            return this.resourceService.hasPrev(this.resourceArray);
        return false;
    }

    public hasLast(): boolean {
        if (this.resourceArray)
            return this.resourceService.hasLast(this.resourceArray);
        return false;
    }

    public next(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.next(this.resourceArray, this.type).pipe(
                map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                }));
        else
            observableThrowError('no resourceArray found');
    }

    public prev(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.prev(this.resourceArray, this.type).pipe(
                map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                }));
        else
            observableThrowError('no resourceArray found');
    }

    public first(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.first(this.resourceArray, this.type)
                .pipe(
                    map((resourceArray: ResourceArray<T>) => {
                        this.resourceArray = resourceArray;
                        return resourceArray.result;
                    })
                );
        else
            observableThrowError('no resourceArray found');
    }

    public last(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.last(this.resourceArray, this.type)
                .pipe(
                    map((resourceArray: ResourceArray<T>) => {
                        this.resourceArray = resourceArray;
                        return resourceArray.result;
                    })
                );
        else
            observableThrowError('no resourceArray found');
    }

    public page(pageNumber: number): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.page(this.resourceArray, this.type, pageNumber).pipe(
                map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                }));
        else
            observableThrowError('no resourceArray found');
    }
}
