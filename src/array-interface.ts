import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {Resource} from './resource';
import {Observable} from 'rxjs/internal/Observable';

export interface ArrayInterface<T extends Resource> {
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    sortInfo: Sort[];
    self_uri: string;
    next_uri: string;
    prev_uri: string;
    first_uri: string;
    last_uri: string;

    push(el: T);

    length(): number;

    next(type: { new(): T }): Observable<ResourceArray<T>>;

    prev(type: { new(): T }): Observable<ResourceArray<T>>;

    first(type: { new(): T }): Observable<ResourceArray<T>>;

    last(type: { new(): T }): Observable<ResourceArray<T>>;

    page(type: { new(): T }, id: number): Observable<ResourceArray<T>>;

    sortElements(type: { new(): T }, ...sort: Sort[]): Observable<ResourceArray<T>>;

    size(type: { new(): T }, size: number): Observable<ResourceArray<T>>;
}