import { Resource } from '../resource';
import { ResourceArray } from '../resource-array';
import { Sort } from './sort';
import { Observable } from 'rxjs';

export interface ArrayInterface<T extends Resource> {

    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    sortInfo: Sort[];
    selfUri: string;
    nextUri: string;
    prevUri: string;
    firstUri: string;
    lastUri: string;

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
