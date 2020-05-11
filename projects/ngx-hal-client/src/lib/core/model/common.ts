import { Resource } from './resource';
import { Sort } from './interface/sort';

export interface ResourceExpire<T extends Resource> {
    entity: any;
    expire: number;
}

export interface HalParam {
    key: string;
    value: Resource | string | number | boolean;
}

export interface LinkOptions {
    strictParams?: boolean;
    params?: LinkParams;
}

export interface LinkParams {
    [paramName: string]: string;
}

export interface HalOptions {
    notPaged?: boolean;
    size?: number;
    sort?: Sort[];
    params?: HalParam[];
}

export enum Include {
    NULL_VALUES = 'NULL_VALUES'
}

export interface ResourceOptions {
    include: Include
    props: Array<string>
}
