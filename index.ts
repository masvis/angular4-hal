import {ModuleWithProviders, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {HalParam, RestService} from './src/rest.service';
import {ExternalService} from './src/external.service';
import {ResourceService} from './src/resource.service';
import {ExternalConfigurationHandlerInterface} from './src/external-configuration.handler';

import 'rxjs';

import {SubTypeBuilder} from './src/subtype-builder';
import {AuthInterceptor} from "./src/interceptor/AuthInterceptor";
import {TokenConfig} from "./src/TokenConfig";
import {TokenConfigService} from "./src/interceptor/TokenConfigService";

export {ExternalService} from './src/external.service';
export {RestService} from './src/rest.service';
export {Resource} from './src/resource';
export {ResourceArray} from './src/resource-array';
export {Sort} from './src/sort';
export {ResourceHelper} from './src/resource-helper';
export {CacheHelper} from './src/cache/cache.helper';
export {EvictStrategy} from './src/cache/cache.helper';
export {ResourceExpire} from './src/cache/cache.helper';
export {ExternalConfiguration} from './src/ExternalConfiguration';
export {ExternalConfigurationHandlerInterface} from './src/external-configuration.handler';
export {HalOptions, HalParam} from "./src/rest.service";
export {SubTypeBuilder} from "./src/subtype-builder";

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
    static forRoot(tokenConfig?: TokenConfig): ModuleWithProviders {
        return {
            ngModule: AngularHalModule,
            providers: [
                ExternalService,
                HttpClient,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true,
                    deps: [TokenConfigService]
                },
                {
                    provide: TokenConfigService,
                    useValue: tokenConfig == null ? '' : tokenConfig
                },
                {
                    provide: ResourceService,
                    useClass: ResourceService,
                    deps: [ExternalService]
                }
            ]
        };
    }
}
