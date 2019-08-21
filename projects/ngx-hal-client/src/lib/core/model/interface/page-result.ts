import { Resource } from '../resource';

/**
 * Object that returns from paged request to Spring application.
 */
export interface PageResult<T extends Resource> {
    _embedded: {
        [key: string]: Array<T>;
    };
    _links: {
        first: {
            href: string
        };
        prev?: {
            href: string
        };
        self: {
            href: string
        };
        next?: {
            href: string
        };
        last: {
            href: string
        };
    };
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}
