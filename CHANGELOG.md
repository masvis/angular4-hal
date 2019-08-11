## 1.0.5 (2019-08-11)

#### Bugs
##### PostRelation/PathRelation methods
Was: `postRelation/pathRelation` returned the same `Resource` object instance on which the method was called.

Now:  `postRelation/pathRelation` returned new `Resource` object instance.

## 1.0.4 (2019-08-11)

#### Features
For `postRelation/pathRelation` methods added converting result to `Resource` class.

## 1.0.3 (2019-08-11)

#### Features

Added ability to pass http request params to `postRelation/pathRelation` methods.

To do that you need to pass `LinkOptions` object as last parameter to `postRelation/pathRelation` methods.

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

Added ability to perform `post/path` requests for resource's relations.

For example, your resource has some relation that mean action and you need to perform post/patch request and pass some parameters.

Now, you can use new `postRelation/pathRelation` methods to do it.
