import { Observable, throwError as observableThrowError } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { ResourceHelper } from '../util/resource-helper';
import { ArrayInterface } from './interface/array-interface';
import { Sort } from './interface/sort';
import { Resource } from './resource';

export class ResourceArray<T extends Resource> implements ArrayInterface<T> {
    public sortInfo: Sort[];

    public proxyUrl: string;
    public rootUrl: string;

    public selfUri: string;
    public nextUri: string;
    public prevUri: string;
    public firstUri: string;
    public lastUri: string;

    public _embedded;

    public totalElements = 0;
    public totalPages = 1;
    public pageNumber = 1;
    public pageSize: number;

    public result: T[] = [];


    constructor(embedded: any) {
        this._embedded = embedded;
    }

    push = (el: T) => {
        this.result.push(el);
    };

    length = (): number => {
        return this.result.length;
    };

    private init = (type: { new(): T }, response: any, sortInfo: Sort[]): ResourceArray<T> => {
        const result: ResourceArray<T> = new ResourceArray<T>(this._embedded);
        result.sortInfo = sortInfo;
        ResourceHelper.instantiateResourceCollection(type, response, result);
        return result;
    };

// Load next page
    next = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.nextUri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.nextUri), {headers: ResourceHelper.headers}).pipe(
                map(response => this.init(type, response, this.sortInfo)),
                catchError(error => observableThrowError(error)),);
        }
        return observableThrowError('no next defined');
    };

    prev = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.prevUri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.prevUri), {headers: ResourceHelper.headers}).pipe(
                map(response => this.init(type, response, this.sortInfo)),
                catchError(error => observableThrowError(error)),);
        }
        return observableThrowError('no prev defined');
    };

// Load first page

    first = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.firstUri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.firstUri), {headers: ResourceHelper.headers}).pipe(
                map(response => this.init(type, response, this.sortInfo)),
                catchError(error => observableThrowError(error)),);
        }
        return observableThrowError('no first defined');
    };

// Load last page

    last = (type: { new(): T }): Observable<ResourceArray<T>> => {
        if (this.lastUri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(this.lastUri), {headers: ResourceHelper.headers}).pipe(
                map(response => this.init(type, response, this.sortInfo)),
                catchError(error => observableThrowError(error)),);
        }
        return observableThrowError('no last defined');
    };

// Load page with given pageNumber

    page = (type: { new(): T }, pageNumber: number): Observable<ResourceArray<T>> => {
        this.selfUri = this.selfUri.replace('{?page,size,sort,projection}', '');
        this.selfUri = this.selfUri.replace('{&sort}', '');
        let urlParsed = new URL(ResourceHelper.getProxy(this.selfUri));
        let query: string = ResourceArray.replaceOrAdd(urlParsed.search, 'size', this.pageSize.toString());
        query = ResourceArray.replaceOrAdd(query, 'page', pageNumber.toString());


        let uri = urlParsed.search ?
            ResourceHelper.getProxy(this.selfUri).replace(urlParsed.search, query) : ResourceHelper.getProxy(this.selfUri).concat(query);
        uri = this.addSortInfo(uri);
        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers}).pipe(
            map(response => this.init(type, response, this.sortInfo)),
            catchError(error => observableThrowError(error)),);
    };

// Sort collection based on given sort attribute


    sortElements = (type: { new(): T }, ...sort: Sort[]): Observable<ResourceArray<T>> => {
        this.selfUri = this.selfUri.replace('{?page,size,sort}', '');
        this.selfUri = this.selfUri.replace('{&sort}', '');
        let uri = ResourceHelper.getProxy(this.selfUri).concat('?', 'size=', this.pageSize.toString(), '&page=', this.pageNumber.toString());
        uri = this.addSortInfo(uri);
        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers}).pipe(
            map(response => this.init(type, response, sort)),
            catchError(error => observableThrowError(error)),);
    };

// Load page with given size

    size = (type: { new(): T }, size: number): Observable<ResourceArray<T>> => {
        let uri = ResourceHelper.getProxy(this.selfUri).concat('?', 'size=', size.toString());
        uri = this.addSortInfo(uri);
        return ResourceHelper.getHttp().get(uri, {headers: ResourceHelper.headers}).pipe(
            map(response => this.init(type, response, this.sortInfo)),
            catchError(error => observableThrowError(error)),);
    };

    private addSortInfo(uri: string) {
        if (this.sortInfo) {
            for (const item of this.sortInfo) {
                uri = uri.concat('&sort=', item.path, ',', item.order);
            }
        }
        return uri;
    }

    private static replaceOrAdd(query: string, field: string, value: string): string {
        if (query) {
            let idx: number = query.indexOf(field);
            let idxNextAmp: number = query.indexOf('&', idx) == -1 ? query.indexOf('/', idx) : query.indexOf('&', idx);

            if (idx != -1) {
                let seachValue = query.substring(idx, idxNextAmp);
                query = query.replace(seachValue, field + '=' + value);
            } else {
                query = query.concat("&" + field + '=' + value);
            }
        } else {
            query = "?" + field + '=' + value;
        }
        return query;
    }
}
