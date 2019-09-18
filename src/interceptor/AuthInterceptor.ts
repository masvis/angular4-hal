import {Inject, Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {TokenConfigService} from "./TokenConfigService";
import {Observable} from "rxjs";
import {Auth} from "./Auth";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(@Inject(TokenConfigService) private config) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        if(this.config) {
            const token: Auth = Object.assign(Auth , JSON.parse(sessionStorage.getItem(this.config.token)));
            if (token && !request.url.endsWith('oauth/token')) {
                const headers = new HttpHeaders({
                    'Authorization': 'Bearer ' + token.access_token,
                    'Content-Type': 'application/json'
                });
                request = request.clone({headers});
            }
        }

        return next.handle(request);
    }
}


