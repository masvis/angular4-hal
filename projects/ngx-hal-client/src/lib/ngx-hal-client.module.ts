import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ExternalService } from './core/service/external.service';
import { ResourceService } from './core/service/resource.service';

export { CacheHelper } from './core/cache/cache.helper';
export { ExternalService } from './core/service/external.service';
export { RestService } from './core/service/rest.service';
export { Resource } from './core/model/resource';
export { EmbeddedResource } from './core/model/embedded-resource';
export { ResourceArray } from './core/model/resource-array';
export { ResourcePage } from './core/model/resource-page';
export { Sort, SortOrder } from './core/model/interface/sort';
export { ResourceHelper } from './core/util/resource-helper';
export { ExternalConfiguration } from './core/config/external-configuration';
export { ExternalConfigurationHandlerInterface } from './core/config/external-configuration.handler';
export { HalOptions, HalParam, Include } from './core/model/common';
export { SubTypeBuilder } from './core/model/interface/subtype-builder';

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
export class NgxHalClientModule {
    static forRoot(): ModuleWithProviders<NgxHalClientModule> {
        return {
            ngModule: NgxHalClientModule,
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
