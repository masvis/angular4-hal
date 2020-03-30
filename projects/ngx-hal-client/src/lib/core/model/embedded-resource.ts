import { Injectable } from '@angular/core';
import { BaseResource } from './base-resource';
import { isObject } from 'rxjs/internal-compatibility';

/**
 * Using for model classes that it is not Resource but can hold Resource as property, for example is Embeddable entity.
 * It's allows to use {@link BaseResource} methods on this objects.
 *
 * class Product extends Resource {
 *      name: string;
 * }
 *
 * class CartItem extends EmbeddedResource { //it is not Resource, just embedded object
 *   product: Product;
 * }
 */
@Injectable()
export class EmbeddedResource extends BaseResource {
}

export function instanceOfEmbeddedResource(object: any) {
    // Embedded resource doesn't have self link in _links array
    return isObject(object) && ('_links' in object) && !('self' in object['_links']);
}

