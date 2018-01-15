import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';
import {Resource} from './resource';

export interface ArrayInterface<T> {
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

    next<T extends Resource>(): Observable<ResourceArray<T>>;

    prev<T extends Resource>(): Observable<ResourceArray<T>>;

    first<T extends Resource>(): Observable<ResourceArray<T>>;

    last<T extends Resource>(): Observable<ResourceArray<T>>;

    page<T extends Resource>(id: number): Observable<ResourceArray<T>>;

    sortElements<T extends Resource>(...sort: Sort[]): Observable<ResourceArray<T>>;

    size<T extends Resource>(size: number): Observable<ResourceArray<T>>;
}