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

            if (token && request.url.indexOf('files/upload') != -1) {
                const headers = new HttpHeaders({
                    'Authorization': 'Bearer ' + token.access_token
                });

                request = request.clone({headers});
            } else if (token && !request.url.endsWith('oauth/token')) {
                let ct: string = request.headers.has('Content-Type') ? request.headers.get('Content-Type') : 'application/json';
                const headers = new HttpHeaders({
                    'Authorization': 'Bearer ' + token.access_token,
                    'Content-Type': ct
                });
                request = request.clone({headers});
            }
        }

        return next.handle(request);
    }
}
