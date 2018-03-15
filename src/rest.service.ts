import {Observable} from 'rxjs/Observable';
import {Resource} from './resource';
import {ResourceArray} from './resource-array';
import {Sort} from './sort';
import {Injector} from '@angular/core';
import {ResourceService} from './resource.service';
import {ErrorObservable} from "rxjs/observable/ErrorObservable";

export class RestService<T extends Resource> {
    private type: any;
    private resource: string;
    public resourceArray: ResourceArray<T>;
    private resourceService: ResourceService;

    constructor(type: { new(): T }, resource: string, private injector: Injector) {
        this.type = type;
        this.resource = resource;
        this.resourceService = injector.get(ResourceService);
    }

    protected handleError(error: any): ErrorObservable {
        return Observable.throw(error);
    }

    public getAll(): Observable<T[]> {
        return this.resourceService.getAll(this.type, this.resource)
            .map((resourceArray: ResourceArray<T>) => {
                this.resourceArray = resourceArray;
                return resourceArray.result;
            });
    }

    public get(id: any): Observable<T> {
        return this.resourceService.get(this.type, this.resource, id);
    }

    public search(query: string, options?: {
        size?: number, sort?: Sort[], params?: [{ key: string, value: string | number }]
    }): Observable<T[]> {
        return this.resourceService.search(this.type, query, this.resource, options)
            .map((resourceArray: ResourceArray<T>) => {
                this.resourceArray = resourceArray;
                return resourceArray.result;
            });
    }

    public count(): Observable<number> {
        return this.resourceService.count(this.resource);
    }

    public create(entity: T): Observable<Object> {
        return this.resourceService.create(this.resource, entity);
    }

    public update(entity: T): Observable<Object> {
        return this.resourceService.update(entity);
    }

    public patch(entity: T): Observable<Object> {
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

    public next(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.next(this.resourceArray, this.type)
                .map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                });
        else
            Observable.throw('no resourceArray found');
    }

    public prev(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.prev(this.resourceArray, this.type)
                .map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                });
        else
            Observable.throw('no resourceArray found');
    }

    public first(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.first(this.resourceArray, this.type)
                .map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                });
        else
            Observable.throw('no resourceArray found');
    }

    public last(): Observable<T[]> {
        if (this.resourceArray)
            return this.resourceService.last(this.resourceArray, this.type)
                .map((resourceArray: ResourceArray<T>) => {
                    this.resourceArray = resourceArray;
                    return resourceArray.result;
                });
        else
            Observable.throw('no resourceArray found');
    }
}
