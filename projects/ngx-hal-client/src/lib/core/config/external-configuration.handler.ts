import { HttpClient } from '@angular/common/http';
import { ExternalConfiguration } from './external-configuration';

export interface ExternalConfigurationHandlerInterface {
    deserialize();
    serialize();

    getProxyUri(): string;
    getRootUri(): string;
    getHttp(): HttpClient;


    getExternalConfiguration(): ExternalConfiguration;
    setExternalConfiguration(externalConfiguration: ExternalConfiguration);
}
