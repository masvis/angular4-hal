import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {Resource} from './resource';

export interface ArrayInterface<T extends Resource> {
    http: HttpClient;
    observable: Observable<any>;
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

    next(): Observable<ResourceArray<T>>;

    prev(): Observable<ResourceArray<T>>;

    first(): Observable<ResourceArray<T>>;

    last(): Observable<ResourceArray<T>>;

    page(id: number): Observable<ResourceArray<T>>;

    sortElements(...sort: Sort[]): Observable<ResourceArray<T>>;

    size(size: number): Observable<ResourceArray<T>>;
}