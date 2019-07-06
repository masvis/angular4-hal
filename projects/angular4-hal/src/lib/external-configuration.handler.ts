import {ExternalConfiguration} from './ExternalConfiguration';
import {HttpClient} from '@angular/common/http';

export interface ExternalConfigurationHandlerInterface {
    deserialize();
    serialize();

    getProxyUri(): string;
    getRootUri(): string;
    getHttp(): HttpClient;


    getExternalConfiguration(): ExternalConfiguration;
    setExternalConfiguration(externalConfiguration: ExternalConfiguration);
}
