import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

declare global {

  type SortOrder = 'DESC' | 'ASC';

  interface Sort {
    path: string;
    order: SortOrder;
  }

  interface Array<T> {
    http: HttpClient;
    observable: Observable<any>;
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    sortInfo: Sort[];
    self_uri: string;
    next_uri: string;
    prev_uri: string;
    first_uri: string;
    last_uri: string;

    next(): Observable<void>;

    prev(): Observable<void>;

    first(): Observable<void>;

    last(): Observable<void>;

    page(id: number): Observable<void>;

    sortElements(...sort: Sort[]): Observable<void>;

    size(size: number): Observable<void>;
  }
}

export * from "./src/angular-hal.module";
export * from "./src/resource.service";
export * from "./src/resource";
