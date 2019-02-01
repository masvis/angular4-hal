import {Resource} from '../resource';
import * as hash from 'hash.js';
import {HalOptions} from '../rest.service';

export type ResourceExpire<T extends Resource> = { entity: any, body?: any, params?: HalOptions, expire: number };

export enum EvictStrategy {
    EvictTrivial,
    EvictSmart
}

export class CacheHelper {
    private static cacheMap: Map<string, ResourceExpire<any>> = new Map<string, ResourceExpire<any>>();

    static isActive = true;
    // TODO
    static maxEntries: number = 100;
    static evictStrategy: EvictStrategy = EvictStrategy.EvictTrivial;
    static defaultExpire: number = 10 * 60 * 1000; //10 minutes

    static initClearCacheProcess() {
        if (this.isActive) {
            setInterval(() => {
                Date.now();
                if (CacheHelper.evictStrategy == EvictStrategy.EvictTrivial)
                    this.evictAll();
                else if (CacheHelper.evictStrategy == EvictStrategy.EvictSmart) {
                    this.cacheMap.forEach((value: ResourceExpire<any>, key: string) => {
                        if (value.expire > 0 && Date.now() > value.expire)
                            this.evict(key);
                    });
                }
            }, 15 * 60 * 1000);
        }
    }

    static ifPresent<T extends Resource>(link: string, body?: string, params?: HalOptions, isActiveLocal: boolean = true): boolean {
        if (!this.isActive || !isActiveLocal)
            return false;
        return this.cacheMap.has(CacheHelper.key(link, body, params));
    }

    static getArray<T extends Resource>(link: string, body?: string, params?: HalOptions): T[] {
        return this.cacheMap.get(CacheHelper.key(link, body, params)).entity;
    }

    static putArray<T extends Resource>(link: string, array: T[], expireMs: number = 10 * 60 * 1000, body?: string, params?: HalOptions) {
        if (this.isActive) {
            let resourceExpire: ResourceExpire<T> = {entity: array, expire: CacheHelper.expireDate(expireMs)};
            this.cacheMap.set(CacheHelper.key(link, body, params), resourceExpire);
        }
    }

    static get<T extends Resource>(link: string, body?: string, params?: HalOptions): T {
        return this.cacheMap.get(CacheHelper.key(link, body, params)).entity;
    }

    static put<T extends Resource>(link: string, array: T, expireMs: number = 10 * 60 * 1000, body?: string, params?: HalOptions) {
        if (this.isActive) {
            let resourceExpire: ResourceExpire<T> = {entity: array, expire: CacheHelper.expireDate(expireMs)};
            this.cacheMap.set(CacheHelper.key(link, body, params), resourceExpire);
        }
    }

    private static expireDate(expireMs: number): number {
        if (expireMs == 0)
            return 0;
        return Date.now() + expireMs;
    }

    private static key(link: string, body?: string, halOptions?: HalOptions): string {

        let k: string = link;
        if (body)
            k += body;

        if (halOptions)
            k += CacheHelper.toStringParams(halOptions);

        let key: string = hash.sha256().update(k).digest('hex');
        return key;
    }

    private static toStringParams(options: HalOptions) {
        let s: string = '';
        if (options.size) {
            s = 'size=' + options.size.toString() + '&';
        }

        if (options.notPaged) {
            s += 'notPaged=true&';
        }

        if (options.params) {
            options.params.forEach(param => {
                s += param.key + '=' + param.value + '&';
            });
        }

        if (options.sort) {
            options.sort.forEach(sortInfo => {
                let sortString = '';
                sortString = sortInfo.path ? sortString.concat(sortInfo.path) : sortString;
                sortString = sortInfo.order ? sortString.concat(',').concat(sortInfo.order) : sortString;
                s += 'sort' + sortString + '&';
            });
        }
        return s;
    }

    static evict(key: string) {
        this.cacheMap.delete(key);
    }

    static evictAll() {
        this.cacheMap.clear();
    }
}
