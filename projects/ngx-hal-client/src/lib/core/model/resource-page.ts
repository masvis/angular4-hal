import { HttpParams } from '@angular/common/http';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ResourceHelper } from '../util/resource-helper';
import { PageResult } from './interface/page-result';
import { Sort } from './interface/sort';
import { Resource } from './resource';
import { ResourceArray } from './resource-array';

/**
 * Object allow to work with paged resources.
 * Contains all paged methods to navigate between pages and sorting page's data.
 */
export class ResourcePage<T extends Resource> {

    public selfUri: string;
    public nextUri: string;
    public prevUri: string;
    public firstUri: string;
    public lastUri: string;

    public totalElements: number;
    public totalPages: number;
    public pageNumber: number;

    public resources: Array<T>;

    private resourceType: any;

    constructor(resourceArray?: ResourceArray<T>, type?: { new(): T }) {
        this.resourceType = type;
        if (resourceArray) {
            this.resources = resourceArray.result;
            this.selfUri = resourceArray.selfUri;
            this.nextUri = resourceArray.nextUri;
            this.prevUri = resourceArray.prevUri;
            this.firstUri = resourceArray.firstUri;
            this.lastUri = resourceArray.lastUri;
            this.totalPages = resourceArray.totalPages;
            this.totalElements = resourceArray.totalElements;
            this.pageNumber = resourceArray.pageNumber;
        }
    }

    init(result: PageResult<T>): ResourcePage<T> {
        const resourcePage = new ResourcePage<T>(null, this.resourceType);
        if (this.resourceType) {
            resourcePage.resources
                = ResourceHelper.instantiateResourceCollection(this.resourceType, result, new ResourceArray<T>('_embedded')).result;
        } else {
            for (const embeddedClassName of Object.keys(result._embedded)) {
                resourcePage.resources = result._embedded[embeddedClassName];
            }
        }
        resourcePage.selfUri = result._links.self.href;
        resourcePage.nextUri = result._links.next && result._links.next.href;
        resourcePage.prevUri = result._links.prev && result._links.prev.href;
        resourcePage.firstUri = result._links.first && result._links.first.href;
        resourcePage.lastUri = result._links.last && result._links.last.href;
        resourcePage.totalElements = result.page.totalElements;
        resourcePage.totalPages = result.page.totalPages;
        resourcePage.pageNumber = result.page.number;

        return resourcePage;
    }

    hasFirst(): boolean {
        return !!this.firstUri;
    }

    hasLast(): boolean {
        return !!this.lastUri;
    }

    hasNext(): boolean {
        return !!this.nextUri;
    }

    hasPrev(): boolean {
        return !!this.prevUri;
    }

    first(): Observable<ResourcePage<T>> {
        return this.doRequest(this.firstUri);
    }

    last(): Observable<ResourcePage<T>> {
        return this.doRequest(this.lastUri);
    }

    next(): Observable<ResourcePage<T>> {
        return this.doRequest(this.nextUri);
    }

    prev(): Observable<ResourcePage<T>> {
        return this.doRequest(this.prevUri);
    }

    page(pageNumber: number): Observable<ResourcePage<T>> {
        const uri = ResourceHelper.removeUrlTemplateVars(this.selfUri);
        let httpParams = new HttpParams({fromString: uri});
        httpParams = httpParams.set('page', pageNumber.toString());

        return this.doRequest(httpParams.toString());
    }

    size(size: number): Observable<ResourcePage<T>> {
        const uri = ResourceHelper.removeUrlTemplateVars(this.selfUri);
        let httpParams = new HttpParams({fromString: uri});
        httpParams = httpParams.set('size', size.toString());

        return this.doRequest(httpParams.toString());
    }

    sortElements(...sort: Sort[]): Observable<ResourcePage<T>> {
        const uri = ResourceHelper.removeUrlTemplateVars(this.selfUri);
        let httpParams = new HttpParams({fromString: uri});
        sort.forEach((s: Sort) => {
            httpParams = httpParams.append('sort', `${ s.path },${ s.order }`);
        });

        return this.doRequest(httpParams.toString());
    }

    private doRequest(uri: string): Observable<ResourcePage<T>> {
        if (uri) {
            return ResourceHelper.getHttp().get(ResourceHelper.getProxy(uri),
                {headers: ResourceHelper.headers})
                .pipe(
                    map((response: PageResult<T>) => this.init(response)),
                    catchError(error => observableThrowError(error)));
        }
        return observableThrowError(`no ${ uri } link defined`);
    }

}
