import {Resource} from '../resource';

export type ResourceExpire<T extends Resource> = { entity: any, expire: number };

export class CacheService<T extends Resource> {

    isActive = true;

    cacheMap: Map<string, ResourceExpire<T>>;

    constructor() {
        if (this.isActive) {
            setInterval(() => {
                Date.now();
                this.evictAll();
            }, 30 * 60 * 1000);
        }
    }

    ifPresent<T extends Resource>(link: string): boolean {
        if (!this.isActive)
            return false;
        return this.cacheMap.has(link);
    }

    getArray<T extends Resource>(link: string): T[] {
        return this.cacheMap.get(link).entity;
    }

    putArray<T extends Resource>(link: string, array: T[], expire: number) {
        if (this.isActive) {
            let resourceExpire: ResourceExpire<T> = {entity: array, expire: expire};
            this.cacheMap.set(link, resourceExpire);
        }
    }

    get<T extends Resource>(link: string): T {
        return this.cacheMap.get(link).entity;
    }

    put<T extends Resource>(link: string, array: T, expire: number) {
        if (this.isActive) {
            let resourceExpire: ResourceExpire<T> = {entity: array, expire: expire};
            this.cacheMap.set(link, resourceExpire);
        }
    }

    evict(link: string) {
        this.cacheMap.delete(link);
    }

    evictAll() {
        this.cacheMap.clear();
    }
}
