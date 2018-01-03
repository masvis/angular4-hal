import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {ResourceService} from './src/resource.service';

export * from "./src/resource.service";
export * from "./src/resource";
export * from "./src/array-interface";
export * from "./src/resource.service";
export * from "./src/resource-array";
export * from "./src/sort";


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
        ResourceService
      ]
    };
  }
}
