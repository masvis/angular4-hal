# HAL Library Angular 5

This Angular module offers a [HAL/JSON](http://stateless.co/hal_specification.html) http-client to easily interact with a [Spring Data Rest](https://projects.spring.io/spring-data-rest) API (and by extend any API that conforms the Spring Data Rest resource model)

!! This module needs Angular version 4.3+ since it uses the new HttpClientModule introduced in 4.3

## Installation
```
npm install angular-hal
```
## Configuration

1. Import AngularHalModule in your app root module
2. ResourceService is the entry-point for interacting with Spring Data Rest resources. Their should be only one application-wide ResourceService. So we add it to the providers of our app root module.
3. Set the base URL of our Spring Data Rest API with the API_URI InjectionToken. Either put a string value or use an environment variable (best practise in multi-environment deployments)

```typescript
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AngularHalModule, ResourceService, API_URI} from 'angular-hal';

import {AppComponent} from './app.component';
import {environment} from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AngularHalModule
  ],
  providers: [
    ResourceService,
    { provide: API_URI, useValue: environment.api_url }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
``` 

## Usage
First of all let's model our resource entities.  
To illustrate we use a simple model of a team and players  
Notice that our entity class extends the Resource class.  
By inheriting the Resource class we give HAL specific features to our entity 

**Attention**: The name and type of the members of your resource class must exactly match the name and type of the members of the resource entity exposed by your API  

```typescript
import {Resource} from 'angular-halh';

export class Player extends Resource{
    firstName: string;
    lastName: string;   
}
```
Since a Team consists of multiple players, we model the one-to-many relationship between the Team resource and the Player resources
```typescript
import {Resource} from 'angular-hal';

export class Team extends Resource {
    name: string;
    players: Player[];
}
```
So far so good, time to make our application interact with the API.  
To illustrate we create a TeamManagerComponent that will implement some basic CRUD on our resources.

```typescript
import {ResourceService} from 'angular-hal';

@Component({...})
export class TeamManagerComponent implements OnInit {

  teams: Team[];
    
  constructor( private rs: ResourceService ) { }

  ngOnInit() {
    this.getAllTeams();
  }

  getAllTeams() {
    this.teams = this.rs.getAll(Team, 'teams');
  }
 }
```
Our component constructor has an argument of type ResourceService. Upon creation of the component the ResourceService instance we defined earlier as a provider in our root module will be injected and be available for further use in the component.  
We create a function getAllTeams() which will fetch all the teams from our backend.
To fetch these teams we use the getAll method of the ResourceService. This method requires 2 parameters:  
+ The type of the resource  
  i.e. Team
+ The relative URI path of the resource  
  i.e. 'teams' for 'http://localhost:8080/teams'

The method will immediately return an empty array. When the response comes in, the array will be automatically populated with fully initialised Team instances.  

The array also has an 'observer' property of type Observable<Team> which you can use to listen for incoming data and to handle errors

```typescript
this.loading = true;
this.teams = this.rs.getAll(Team, 'teams');
this.teams.observable.subscribe(
      undefined, //incoming data is 
      error => console.log(error),
      () => this.loading = false
    );
``` 

Every Team instance has hypermedia capabilities. i.e. To get all players of a team, you can simply do the following:

```typescript
let myTeam = this.teams[0];
myTeam.players = myTeam.getAll(Player, 'players');
```
Parameters:
+ The type of the resource  
  i.e. Player
+ The name of the relation. The value must match a member of the _links object in the HAL response of the owning resource  
  i.e. 'players'

This method call will return an array of fully initialised 'Player' instances. Again every Player instance has hypermedia capabilities to further traverse our API.  

See the API section of this documentation for all capabilities and options.

angular-hal!  

## Authentication

This library uses Angular's HTTPClient module under the hood. Just implement your own authentication HttpInterceptor and wire it in your application using the HTTP_INTERCEPTORS Injectiontoken.  
https://angular.io/guide/http#intercepting-all-requests-or-responses


## API
### ResourceService
TODO
### Resource
TODO
 
## Demo Application
TODO

## Roadmap

+ Error handling
+ Add support for projections
