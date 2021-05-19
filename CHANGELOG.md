## 1.2.4 (2021-05-19)
Peer dependencies changes.

## 1.2.3 (2021-03-24)
### Enhancement
Added support to relative `rootUri` and `proxyUri` uris.

## 1.2.2 (2021-03-06)
### Bug fixing
Fixed [issue](https://github.com/lagoshny/ngx-hal-client/issues/43).
Now `ResourcePage.size(...)` method reset pageNumber to `0`.

## 1.2.1 (2021-03-02)
### Bug fixing
Fixed [issue](https://github.com/lagoshny/ngx-hal-client/issues/41).

## 1.2.0 (2021-02-21)
### Changed resource methods

Based on [issue](https://github.com/lagoshny/ngx-hal-client/issues/39).

Changed `Resource` methods:

- `addRelation` added support for an array of resources to the second param, with an array param all passed entities will be added to the collection behind relation.
- `updateRelation` added support for an array of resources to the second param, with an array param all passed entities will be added to the collection behind relation.
- `substituteRelation` added support for an array of resources to the second param, with an array param all passed entities will be replacing old entities to the collection behind relation.

Added `Resource` methods:

- `clearCollectionRelation` - Unbind all resources from collection by the relation name.

## 1.1.9 (2021-02-19)
#### Resolve build warnings
Fixed [issue](https://github.com/lagoshny/ngx-hal-client/issues/31).

## 1.1.8 (2021-02-18)
#### Bug fixing
Fixed [issue](https://github.com/lagoshny/ngx-hal-client/issues/36).

## 1.1.7 (2021-02-09)
#### Dependency fix
Fixed warnings: CommonJS or AMD dependencies can cause optimization bailouts.

## 1.1.6 (2021-02-09)
#### Update
Updated to Angular 11 version.

## 1.1.4 (2020-09-30)
#### Refactoring
Change return type `BaseResource.getRelation` from `Observable<Resource>` to `Observable<T>`.
Change return type `BaseResource.getProjection` from `Observable<Resource>` to `Observable<T>`.

#### Bug fixing
Fixed [issue](https://github.com/lagoshny/ngx-hal-client/issues/28).

## 1.1.3 (2020-08-03)
#### Refactoring
Fix some build warnings.

## 1.1.0 (2020-06-29)
#### Update
Updated to Angular 10 version.

## 1.0.24 (2020-06-20)
#### Enhancement
Added `getAllPage` method to the `rest service` requested by [issue](https://github.com/lagoshny/ngx-hal-client/issues/21).

## 1.0.23 (2020-05-13)
#### Bug fixing
Resolve circular dependencies.

## 1.0.22 (2020-05-11)
#### Bug fixing
Fixed [issue](https://github.com/lagoshny/ngx-hal-client/issues/13#issuecomment-626912937)

## 1.0.21 (2020-04-30)
#### Bug fixing
Added CacheHelper to exports.
Now you can have access to CacheHelper in you applications.

## 1.0.20 (2020-04-27)
#### Enhancement

Added support explicitly passing `null` values using resource service `patch` method.

For example, you have some `book` entity:

```
Book:
{
   name: 'Some name',
   price: 1000
}
``` 

Suppose, it's already exist in your database, but you want to change for example `name` property to `null` value.

If you set `book.name = null`, this value will be ignored when `JSON` will generate. 
We skip `null` or `undefined` values
to avoid unforeseen situations when part of your object has `null` or `undefined` values that can override normal values in a database.


If you really need to pass `null` values, now you have two options:
 
##### First option

`patch` method allows passing additional param like `enum` constant (`Include` that you can import from `@lagoshny/ngx-hal-client`):


```
yourService.patch(bookEntity, Include.NULL_VALUES)
``` 

It means that **ALL** bookEntity `null` values will be added to result `JSON`:

##### Second option
Sometimes you may want add `null` values for **some properties** not for **all**.

To do this you need pass another second param to `patch` method:

```
yourService.patch(bookEntity, [{props: ['name', 'price'], include: Include.NULL_VALUES}])
``` 

`[{props: ['name'], include: Include.NULL_VALUES}]` it's the array with objects that describe with entity prop names that can have `null` values 
what the second parameter `include: Include.NULL_VALUES` indicates                                               

**Important!** All two options will be work only for props with `null` values and will not work for `undefined` values, `undefined` values still ignored.

## 1.0.19 (2020-04-10)
#### Bug fixing
Fixed bug with `resolveRelations` for `@OneToMany` mapping.

With `@OneToMany` mapping you will have the next JSON snippet
```
{
  _links: {
    self: { href: "http://example.com/order/1" }
  },
  ...
  client: {
      ...
      name: "Ivan",
      _links: {
        self: { href: "http://example.com/client/1" }
      },
  },
  books: [
      {
        ...
        cost: 300,
        _links: {
          self: { href: "http://example.com/book/1" }
        }
      },
      {
        ...
        cost: 200,
        _links: {
          self: { href: "http://example.com/book/2" }
        }
      }
    ]
}
```

Before send `PATCH`, `POST`, `PUT` request to the server we need to convert all related resources to url presentation.

For `client` relation it will be as: 

`client: "http://example.com/client/1"`

But was a bug with convert arrays relations to url presentation and for `books` relation we got:

````
books: [
      {
        ...
        cost: 300,
        _links: {
          self: { href: "http://example.com/book/1" }
        }
      },
      {
        ...
        cost: 200,
        _links: {
          self: { href: "http://example.com/book/2" }
        }
      }
]
````

instead of:

````
books: [
      "http://example.com/book/1",
      "http://example.com/book/2"
]
````

For more details see [this](https://github.com/lagoshny/ngx-hal-client/pull/12) pull request.

## 1.0.18 (2020-03-30)
#### Enhancement
Added support to embedded resources.

##### Before:

When you have `@Embeddable` Hibernate entities in you backed application like this:

```@Entity
public class Cart {
    ....

    @ElementCollection
    private List<CartItem> items = new ArrayList<>();

    ...
}

@Embeddable
public class CartItem {
    ....

    @ManyToOne
    private Product product;

    ...
}
```

And you have frontend model like this:

````
export class Cart extends Resource {
    items: CartItem[];
}
export class Product extends Resource {
  name: string;
}
export class CartItem { //it is not Resource, just embedded object
    product: Product;
}
````

Then you can't to use hal-client `getRelation` method on `CarItem` class to get `Product` relation.

```
cartService.get(1).subscribe(cart => {
    cart.items[0].getRelation(Product, 'product')
        .subscribe(product => {
            // todo smth
        })
    })
});
```

You will get error **ERROR TypeError: cart.items[0].getRelation is not a function**

##### Now:
But now to make to work it you need extend `CartItem` frontend class  from new hal-client `EmbeddedResource` like this:

````
export class Cart extends Resource {
    items: CartItem[];
}
export class Product extends Resource {
  name: string;
}
export class CartItem extends EmbeddedResource {
    product: Product;
}
````

After that `getRelation` in `CartItem` `Product` relation:
 
```
cart.items[0].getRelation(Product, 'product')
    .subscribe(product => {
        // todo smth
    })
});
``` 
 
will be work as expected.

## 1.0.16 (2020-03-12)
#### Enhancement
Improved templated link support for the **postRelation/patchRelation** methods.
Added dependency to the [uri-templates](https://www.npmjs.com/package/uri-templates) library that allows replace url template params with real values.

Now you can use templated urls for your relation like this:

```
http://example.com/prefix/{?projection}
http://example.com/artists/{artist}
http://example.com/date/{colour}/{shape}
```

And so on, for further information see [uri-templates](https://www.npmjs.com/package/uri-templates) documentation. 

More about **postRelation/patchRelation** methods see [here](#Features-PostRelation-/-PatchRelation)

## 1.0.15 (2020-03-08)
#### Bug fixing
Fixed bug with cache entity links.

For example you create some Task entity that have the next json representation:
```
Task JSON example:
{
  "id": 1,
  ...
  "autoReduce": false,
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/v1/tasks/1"
    },
    "category": {
      "href": "http://localhost:8080/api/v1/tasks/1/category"
    }
    ...
  }
}
```

Suppose that now you want see the task category entity and you invoke the `getRelation` method with 'category' relation name on the task entity.

When you get the category this data will be cached to prevent unnecessary request to the server when you will again get Task category.

```
TaskCategory JSON example:

{
  "id" : 1,
  "name" : "Default",
  ...
  "_links" : {
    "self" : {
      "href" : "http://localhost:8080/api/v1/task-categories/1"
    },
    ...
  }
}
```

**Important!** Link to the category from the task it's not canonical link to the concrete category it's link allows to get current category to the task.

When you will update the task category you will not change this link, but a data returned from this link request will be changed.

```
TaskCategory JSON example:

{
  "id" : 2,
  "name" : "Work",
  ...
  "_links" : {
    "self" : {
      "href" : "http://localhost:8080/api/v1/task-categories/2"
    },
    ...
  }
}
```

And if you will try get a new category using the `getRelation` method you will get the old category because you will get it from the cache (we don't change the link to the category from the task when the category was changed).

After fixing this bug all links data will be evict after any change Task entity and now you will have request to the server when change task category to get fresh the category data. 

## 1.0.14 (2020-03-06)
#### Bug fixing
Fixed bug with protected constructor in Resource class provided by [issue](https://github.com/lagoshny/ngx-hal-client/issues/5)

## 1.0.13 (2020-03-05)
#### Bug fixing
Fixed bug by [issue](https://github.com/lagoshny/ngx-hal-client/issues/4)

## 1.0.12 (2020-03-03)
Updated Angular version to 9 with disabled Ivy.

## 1.0.9 (2019-11-15)
#### Features
- Added to `Resource` class `getSelfLinkHref` method to get self href link that can be used as param for server endpoint.
- Now you can use `Reosurce` type as `HalParam`. In this case your `Resource` class need to have self href link, because when will do converting `HalParams` in request params, for `Resource` param type will use the self href url link where resource can be found.

## 1.0.8 (2019-10-13)
Updated Angular version.

## 1.0.7 (2019-09-16)

#### Features
Added to `ResourcePage` additional properties:

- totalPages - count pages
- totalElements - count elements on the page

## 1.0.6 (2019-08-19)

#### Features
Added `searchPage` method to `RestService` that allows getting a list of resources wrapped in page object thereby allowing to receive resources in parts for the more comfortable display of data to the user. 
`searchPage` method returns `ResourcePage` model which has `resources` property where holds array returned resources and also has next methods:

- hasFirst - return `true` when returned page has link to first page, otherwise `false`
- hasLast - return `true` when returned page has link to last page, otherwise `false`
- hasNext - return `true` when returned page has link to next page, otherwise `false`
- hasPrev - return `true` when returned page has link to prev page, otherwise `false`
- first - perform request by first link to get first page
- last - perform request by last link to get last page
- next - perform request by next link to get next page
- prev - perform request by prev link to get prev page
- page - perform request to the specified page
- size - perform request with specified size
- sortElements - perform request with specified sort params

## 1.0.5 (2019-08-11)

#### Bugs
##### PostRelation/PatchRelation methods
Was: `postRelation/patchRelation` returned the same `Resource` object instance on which the method was called.

Now:  `postRelation/patchRelation` returned new `Resource` object instance.

## 1.0.4 (2019-08-11)

#### Features
For `postRelation/patchRelation` methods added converting result to `Resource` class.
    
## 1.0.3 (2019-08-11)

#### Features PostRelation / PatchRelation

Added ability to pass http request params to `postRelation/patchRelation` methods.

To do that you need to pass `LinkOptions` object as last parameter to `postRelation/patchRelation` methods.

`LinkOptions` consists of

````
{
   strictParams: true | false,
   params: {
     name: valueAsString
   }
}  
```` 

If `strictParams` is false (default value) then **all** passed `params` will be added in relation's link url.

When `strictParams`is true then only params contained in relation's href (e.g. `{?projection}`) and mapped to passed params will be added in relation's link url.
 
For example, you have `Task` resource with custom relation `updateStatus` and `link` like this `http://host.com/api/v1/tasks/task_id/update/status{?projection}`. 
After update tasks status you want to get updated task with projection. 

If you will post relation with `strictParams` then only `projection` param will be added, other params will be ignored. 
On the other hand without `strictParams` all passed params will be added to link's href.

## 1.0.2 (2019-08-09)

#### Features

Added ability to perform `post/patch` requests for resource's relations.

For example, your resource has some relation that mean action and you need to perform post/patch request and pass some parameters.

Now, you can use new `postRelation/patchRelation` methods to do it.
