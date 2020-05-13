import { Injectable } from '@angular/core';
import { BaseResource } from './base-resource';

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
