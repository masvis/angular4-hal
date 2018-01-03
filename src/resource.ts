import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {Sort} from './sort';
import {ResourceArray} from './resource-array';

export abstract class Resource {

  static path: string;
  public http: HttpClient;
  public observable: Observable<any>;
  public _links: any;
  [index: string]: any;

  constructor() {
  }

  // Get collection of related resources

  getAll<T extends Resource, R extends ResourceArray<T>>(type: { new(): T }, relation: string, options?: {
    size?: number, sort?: Sort[],
    params?: [{ key: string, value: string | number }]
  }): ResourceArray<T> {

    const params = ResourceHelper.optionParams(new HttpParams(), options);
    const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
    result.observable = this.http.get(this._links[relation].href, {params: params});
    result.observable.subscribe(response => ResourceHelper.instantiateResourceCollection<T, R>(type, response, result));
    return result;
  }

  // Get related resource

  get<R extends Resource>(type: { new(): R }, relation: string): R {
    const result: R = new type();
    result.observable = this.http.get(this._links.relation.href);
    result.observable.subscribe(data => {
      ResourceHelper.instantiateResource(result, data, this.http);
    });
    return result;
  }

  // Bind the given resource to this resource by the given relation

  bind<R extends Resource>(resource: R): Observable<any> {
    return this.http.put(this._links.relation.href, resource._links.self.href);
  }


  // Unbind the resource with the given relation from this resource

  unbind(relation: string): Observable<any> {
    return this.http.delete(this._links.relation.href);
  }

  // Adds the given resource to the bound collection by the relation

  add<R extends Resource>(relation: string, resource: R): Observable<any> {
    return this.http.post(this._links[relation].href, resource._links.self.href,
      {headers: new HttpHeaders().set('Content-Type', 'text/uri-list')});
  }

}
