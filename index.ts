import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RestService} from './src/rest.service';
import {ExternalService} from './src/external.service';

export {API_URI, PROXY_URI, ExternalService} from "./src/external.service";
export {RestService} from './src/rest.service';
export {Resource} from "./src/resource";
export {ResourceArray} from "./src/resource-array";
export {Sort} from "./src/sort";
export {ResourceHelper} from "./src/resource-helper";

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  exports: [HttpClientModule],
  providers: [HttpClient]
})
export class AngularHalModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AngularHalModule,
      providers: [
      ]
    };
  }
}