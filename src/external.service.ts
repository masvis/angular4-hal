import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {ResourceHelper} from './resource-helper';
import {ExternalConfigurationHandlerInterface} from './external-configuration.handler';
import {ExternalConfiguration} from './ExternalConfiguration';

@Injectable()
export class ExternalService {

    constructor(
                private http: HttpClient) {

        ResourceHelper.setProxyUri("");
        ResourceHelper.setRootUri("");
    }

    public getExternalConfiguration(): ExternalConfiguration {
        return null;
    }

    public getProxyUri(): string {
        return "";
    }

    public getRootUri(): string {
        return "";
    }

    public getURL(): string {
        return ResourceHelper.getURL();
    }

    public getHttp(): HttpClient {
        return this.http;
    }
}