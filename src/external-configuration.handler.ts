import {ExternalConfiguration} from './ExternalConfiguration';

export interface ExternalConfigurationHandlerInterface {
    deserialize();
    serialize();

    getProxyUri(): string;
    getRootUri(): string;

    getExternalConfiguration(): ExternalConfiguration;
    setExternalConfiguration(externalConfiguration: ExternalConfiguration);
}
