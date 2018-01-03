import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {Sort} from './sort';

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

    next(): Observable<void>;

    prev(): Observable<void>;

    first(): Observable<void>;

    last(): Observable<void>;

    page(id: number): Observable<void>;

    sortElements(...sort: Sort[]): Observable<void>;

    size(size: number): Observable<void>;
}