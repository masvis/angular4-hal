import {Observable} from 'rxjs/Observable';

export class ResourceArray {

  totalElements = 0;
  totalPages = 1;
  pageNumber = 1;

// Load next page
  next = function (): Observable<void> {
    if (this.next_uri) {
      return this.http.get(this.next_uri)
        .map(response => this.init(response, this.sortInfo))
        .catch(error => Observable.throw(error));
    }
  };

  prev = function (): Observable<void> {
    if (this.prev_uri) {
      return this.http.get(this.prev_uri)
        .map(response => this.init(response, this.sortInfo))
        .catch(error => Observable.throw(error));
    }
  };

// Load first page

  first = function (): Observable<void> {
    if (this.first_uri) {
      return this.http.get(this.first_uri)
        .map(response => this.init(response, this.sortInfo))
        .catch(error => Observable.throw(error));
    }
  };

// Load last page

  last = function (): Observable<void> {
    if (this.last_uri) {
      return this.http.get(this.last_uri)
        .map(response => this.init(response, this.sortInfo))
        .catch(error => Observable.throw(error));
    }
  };

// Load page with given pageNumber

  page = function (id: number): Observable<void> {
    const uri = this.self_uri.concat('?', 'size=', this.pageSize.toString(), '&page=', id.toString());
    for (const item of this.sortInfo) {
      uri.concat('&sort=', item.path, ',', item.order);
    }
    return this.http.get(uri)
      .map(response => this.init(response, this.sortInfo))
      .catch(error => Observable.throw(error));
  };

// Sort collection based on given sort attribute


  sortElements = function (...sort: Sort[]): Observable<void> {
    const uri = this.self_uri.concat('?', 'size=', this.pageSize.toString(), '&page=', this.pageNumber.toString());
    for (const item of sort) {
      uri.concat('&sort=', item.path, ',', item.order);
    }
    return this.http.get(uri)
      .map(response => this.init(response, sort))
      .catch(error => Observable.throw(error));
  };

// Load page with given size

  size = function (size: number): Observable<void> {
    const uri = this.self_uri.concat('?', 'size=', size.toString());
    for (const item of this.sortInfo) {
      uri.concat('&sort=', item.path, ',', item.order);
    }
    return this.http.get(uri)
      .map(response => this.init(response, this.sortInfo))
      .catch(error => Observable.throw(error));
  };
}
