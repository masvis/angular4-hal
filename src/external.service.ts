import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {ResourceHelper} from './resource-helper';
import {ExternalConfigurationHandlerInterface} from './external-configuration.handler';
import {ExternalConfiguration} from './ExternalConfiguration';

@Injectable()
export class ExternalService {

    constructor(@Inject('ExternalConfigurationService') private externalConfigurationService: ExternalConfigurationHandlerInterface) {
        ResourceHelper.setProxyUri(externalConfigurationService.getProxyUri());
        ResourceHelper.setRootUri(externalConfigurationService.getRootUri());
        ResourceHelper.setHttp(externalConfigurationService.getHttp());
    }

    public getExternalConfiguration(): ExternalConfiguration {
        return this.externalConfigurationService.getExternalConfiguration();
    }

    public getProxyUri(): string {
        return this.externalConfigurationService.getProxyUri();
    }

    public getRootUri(): string {
        return this.externalConfigurationService.getRootUri();
    }

    public getURL(): string {
        return ResourceHelper.getURL();
    }

    public getHttp(): HttpClient {
        return ResourceHelper.getHttp();
    }
}