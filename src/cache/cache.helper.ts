import {Resource} from '../resource';

export type ResourceExpire<T extends Resource> = { entity: any, expire: number };

export enum EvictStrategy {
    EvictTrivial,
    EvictSmart
}

export class CacheHelper {
    static isActive = true;
    static evictStrategy: EvictStrategy = EvictStrategy.EvictTrivial;
    static cacheMap: Map<string, ResourceExpire<any>> = new Map<string, ResourceExpire<any>>();
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
                            this.cacheMap.delete(key);
                    });
                }
            }, 15 * 60 * 1000);
        }
    }

    static ifPresent<T extends Resource>(link: string): boolean {
        if (!this.isActive)
            return false;
        return this.cacheMap.has(link);
    }

    static getArray<T extends Resource>(link: string): T[] {
        return this.cacheMap.get(link).entity;
    }

    static putArray<T extends Resource>(link: string, array: T[], expireMs: number = 10 * 60 * 1000) {
        if (this.isActive) {
            let resourceExpire: ResourceExpire<T> = {entity: array, expire: CacheHelper.expireDate(expireMs)};
            this.cacheMap.set(link, resourceExpire);
        }
    }

    static get<T extends Resource>(link: string): T {
        return this.cacheMap.get(link).entity;
    }

    static put<T extends Resource>(link: string, array: T, expireMs: number = 10 * 60 * 1000) {
        if (this.isActive) {
            let resourceExpire: ResourceExpire<T> = {entity: array, expire: CacheHelper.expireDate(expireMs)};
            this.cacheMap.set(link, resourceExpire);
        }
    }

    private static expireDate(expireMs: number): number {
        if (expireMs == 0)
            return 0;
        return Date.now() + expireMs;
    }

    static evict(link: string) {
        this.cacheMap.delete(link);
    }

    static evictAll() {
        this.cacheMap.clear();
    }
}
