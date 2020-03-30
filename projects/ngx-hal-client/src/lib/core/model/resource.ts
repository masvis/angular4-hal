import { Injectable } from '@angular/core';
import { BaseResource } from './base-resource';

@Injectable()
export abstract class Resource extends BaseResource {

    public getSelfLinkHref(): string {
        return this.getRelationLinkHref('self');
    }

}
