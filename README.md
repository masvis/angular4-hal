# HAL Library Angular 4 to 7

This Angular module offers a [HAL/JSON](http://stateless.co/hal_specification.html) http-client to easily interact with a [Spring Data Rest](https://projects.spring.io/spring-data-rest) API (and by extend any API that conforms the Spring Data Rest resource model)

This module needs Angular version 4.3+ since it uses the new HttpClientModule introduced in 4.3

## Donation
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=W8UMTH5FJV6G2)


## Installation
```
npm install angular4-hal --save
```
## Configuration

1. Import AngularHalModule in your app root module
2. ResourceService is the entry-point for interacting with Spring Data Rest resources. Their should be only one application-wide ResourceService. So we add it to the providers of our app root module.

NB: Removed API_URI and PROXY_URI in favor of ExternalConfigurationService
ExternalConfigurationService allows you to load configurations in a generic way by extending ExternalConfiguration

In simple case proxy and root uri's are a simple string.

```typescript
import {Injectable} from '@angular/core';
import {ExternalConfigurationHandlerInterface, ExternalConfiguration} from 'angular4-hal';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ExternalConfigurationService implements ExternalConfigurationHandlerInterface {

  getProxyUri(): string {
    return 'http://proxy.url/api/';
  }

  getRootUri(): string {
    return 'https://serviceip.tomcat:8080/APP/';
  }

  getHttp(): HttpClient {
    return this.http;
  }

  constructor(private http: HttpClient) {
  }

  getExternalConfiguration(): ExternalConfiguration {
    return null;
  }

  setExternalConfiguration(externalConfiguration: ExternalConfiguration) {
  }
}
```

```typescript
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AngularHalModule} from 'angular4-hal';

import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {ExternalConfigurationService} from './ExternalConfigurationService'

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AngularHalModule.forRoot()
  ],
  providers: [
    {provide: 'ExternalConfigurationService', useClass: ExternalConfigurationService}
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
import {Resource} from 'angular4-hal';

export class Player extends Resource {
    id: number;
    firstName: string;
    lastName: string;   
}
```
Since a Team consists of multiple players, we model the one-to-many relationship between the Team resource and the Player resources
```typescript
import {Resource} from 'angular4-hal';

export class Team extends Resource {
    name: string;
    businessName: string;
    players: Player[];
}
```
So far so good, time to make our application interact with the API.  
To illustrate we create a TeamManagerComponent that will implement some basic CRUD on our resources.

```typescript
import {TeamsService} from './team.service';

@Component({...})
export class TeamManagerComponent implements OnInit {

  teams: Team[];
    
  constructor( private teamService: TeamsService ) { }

  ngOnInit() {
    this.getAllTeams();
  }

  getAllTeams() {
    this.teamService.getAll()
    .subscribe((teams: Team[]) => {
        this.teams = teams;
    });
  }
 }
```
Our component constructor has an argument of type RestService. Upon extends RestService instance.  
We have a function getAll() which will fetch all the teams from our backend.
To fetch these teams we use the getAll method of the ResourceService. This method requires 2 parameters:  
+ The type of the resource  
  i.e. Team
+ The relative URI path of the resource  
  i.e. 'teams' for 'http://localhost:8080/teams'

The method will immediately return an empty array. When the response comes in, the array will be automatically populated with fully initialised Team instances.  

The array also has an 'observer' property of type Observable<Team[]> which you can use to listen for incoming data and to handle errors

```typescript
@Injectable()
export class TeamsService extends RestService<Team> {

  constructor(injector: Injector) {
    super(Team, 'teams', injector);
  }

  public findByName(name: string): Observable<Team[]> {
    let options: any = {params: [{key: 'name', value: name}]};
    return this.search('findByName', options);
  }

  public findByBusinessName(businessName: string): Observable<Team> {
      let options: any = {params: [{key: 'businessName', value: businessName}]};
      return this.searchSingle('findByBusinessName', options);
  }
}
``` 

Every Team instance has hypermedia capabilities. i.e. To get all players of a team, you can simply do the following:

```typescript
    let myTeam: Team = this.teams[0];
    myTeam.getRelationArray(Player, 'players').subscribe(
      (players: Player[]), => myTeam.players = players
      (error) => console.log(error),
      () => this.loading = false
    );
```
Parameters:
+ The type of the resource  
  i.e. Player
+ The name of the relation. The value must match a member of the _links object in the HAL response of the owning resource  
  i.e. 'players'

This method call will return an array of fully initialised 'Player' instances. Again every Player instance has hypermedia capabilities to further traverse our API.  

See the API section of this documentation for all capabilities and options.

Subtype support:

```typescript
export class Addon extends Resource {

  constructor() {
    super();
  }

  public id: number;

  public maxTimeToAnalize: number;
  public threshold: number;

  public device: Device;
}

export class TemperatureAddon extends Addon {

}

  export class CO2Addon extends Addon {

}

```

Implement SubTypeBuilder interface

```typescript
export class AddonBuilder implements SubTypeBuilder {

    subtypes: Map<string, any> = new Map<string, any>();

    constructor() {
        this.subtypes.set('temperatureAddon', TemperatureAddon);
        this.subtypes.set('temperatureAddons', TemperatureAddon);
        this.subtypes.set('CO2Addon', CO2Addon);
        this.subtypes.set('cO2Addons', CO2Addon);
    }
}
```

```typescript
export class Device {
    public addons: Addon[];

    public getAddons(): Observable<Addon[]> {
            return this.getRelationArray(Addon, 'addons', null, new AddonBuilder());
        }
}
```

```typescript
let device: Device = new Device();

device.getAddons()
    .subscribe((addons: Addon[]) => {
        console.log(addons);
        /* (3) [TemperatureAddon, HumidityAddon, CO2Addon]
           0 : TemperatureAddon {subtypes: undefined, id: 3, threshold: null, maxTimeToAnalyze: null, _links: {…}, …}
           1 : HumidityAddon {subtypes: undefined, id: 2, threshold: null, maxTimeToAnalyze: null, _links: {…}, …}
           2 : CO2Addon {subtypes: undefined, id: 1, threshold: null, maxTimeToAnalyze: null, _links: {…}, …}
           length : 3
        */
    });
```


## Authentication

This library uses Angular's HTTPClient module under the hood. Just implement your own authentication HttpInterceptor and wire it in your application using the HTTP_INTERCEPTORS Injectiontoken.  
https://angular.io/guide/http#intercepting-all-requests-or-responses


## API
### RestService
+ getAll()
+ get()
+ customQuery()
+ search() in server-side with spring satify findBy* and countBy*
+ searchSingle
+ create()
+ update()
+ patch()
+ delete()
+ hasNext()
+ hasPrev()
+ next()
+ prev()
+ first()
+ last()
+ count() require implementation server-side custom repository method countAll
+ totalElements()


### Resource
+ getRelationArray()
+ getRelation()
+ addRelation()   // add relation
+ updateRelation() // update relation
+ substituteRelation()
+ deleteRelation()    // remove relation

### ResourceHelper
+ headers
+ getURL()
+ getHttp()

## Roadmap
+ caching
