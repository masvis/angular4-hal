import {Observable} from "rxjs/Observable";
import {Resource} from './resource';
import {ResourceArray} from './resource-array';
import {ResourceService} from './resource.service';
import {Sort} from './sort';

export class RestService<T extends Resource> {
  private type: any;
  private resource: string;
  public resourceArray: ResourceArray<T>;

  constructor(type: { new(): T },
              resource: string,
              protected resourceService: ResourceService) {
    this.type = type;
    this.resource = resource;
  }

  protected handleError(error: any) {

    return Observable.throw(error);
  }

  public getAll(): Observable<T[]> {
    return this.resourceService.getAll(this.type, this.resource)
      .map((resourceArray: ResourceArray<T>) => {
        this.resourceArray = resourceArray
        return resourceArray.result;
      });
  }

  public get(id: any): Observable<T> {
    return this.resourceService.get(this.type, this.resource, id);
  }

  public search(query: string, options?: {
    size?: number, sort?: Sort[], params?: [{ key: string, value: string | number }]
  }): Observable<T[]> {
    return this.resourceService.search(this.type, query, this.resource, options)
      .map((resourceArray: ResourceArray<T>) => {
        this.resourceArray = resourceArray
        return resourceArray.result;
      });
  }

  public hasNext(): boolean {
    if (this.resourceArray)
      return this.resourceService.hasNext(this.resourceArray);
    return false;
  }

  public next(): Observable<T[]> {
    if (this.resourceArray)
      return this.resourceService.next(this.resourceArray, this.type)
        .map((resourceArray: ResourceArray<T>) => {
          this.resourceArray = resourceArray
          return resourceArray.result;
        });
    else
      Observable.throw("no resourceArray found");
  }

  public prev(): Observable<T[]> {
    if (this.resourceArray)
      return this.resourceService.prev(this.resourceArray, this.type)
        .map((resourceArray: ResourceArray<T>) => {
          this.resourceArray = resourceArray
          return resourceArray.result;
        });
    else
      Observable.throw("no resourceArray found");
  }

  public first(): Observable<T[]> {
    if (this.resourceArray)
      return this.resourceService.first(this.resourceArray, this.type)
        .map((resourceArray: ResourceArray<T>) => {
          this.resourceArray = resourceArray
          return resourceArray.result;
        });
    else
      Observable.throw("no resourceArray found");
  }

  public last(): Observable<T[]> {
    if (this.resourceArray)
      return this.resourceService.last(this.resourceArray, this.type)
        .map((resourceArray: ResourceArray<T>) => {
          this.resourceArray = resourceArray
          return resourceArray.result;
        });
    else
      Observable.throw("no resourceArray found");
  }
}
