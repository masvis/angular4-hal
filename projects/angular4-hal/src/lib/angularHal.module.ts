import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {ExternalService} from './external.service';
import {ResourceService} from './resource.service';
import 'rxjs';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  exports: [HttpClientModule],
  providers: [
    ExternalService,
    HttpClient,
    {
      provide: ResourceService,
      useClass: ResourceService,
      deps: [ExternalService]
    }]
})
export class AngularHalModule {
  static forRoot(): ModuleWithProviders<AngularHalModule> {
    return {
      ngModule: AngularHalModule,
      providers: [
        ExternalService,
        HttpClient,
        {
          provide: ResourceService,
          useClass: ResourceService,
          deps: [ExternalService]
        }
      ]
    };
  }
}
