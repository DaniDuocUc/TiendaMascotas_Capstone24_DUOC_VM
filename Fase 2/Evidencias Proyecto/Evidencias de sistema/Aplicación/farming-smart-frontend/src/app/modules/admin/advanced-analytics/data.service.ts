import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class DataService {
    private readonly _api: string = ''
    private readonly _httpOptions: any;

    constructor(
        private _http: HttpClient,
    ) {
        this._api = environment.analyticsUrl;
        this._httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'x-api-key': environment.apiKeyAnalytics
            }),
        };
    }

    get<T>(url: string, options?: {}): Observable<T> {
        // @ts-ignore
        return this._http
            .get<T>(this._api + url, this._httpOptions)
    }


    getModified<T>(url: string, options?: {}): Observable<T> {
        return this._http.get<T>(url, options);
    }

    post<T>(url: string, body: any, options?: {}): Observable<T> {
        const concat = {
            ...this._httpOptions,
            ...options,
        };
        // @ts-ignore
        return this._http.post<T>(this._api + url, body, concat).pipe(
            catchError(this._handleError)
        )
    }

    postModified<T>(url: string, body: any, options?: {}): Observable<T> {
        // @ts-ignore
        return this._http.post<T>(url, body, {
            ...this._httpOptions,
            ...options
        });
    }

    put<T>(url: string, body: any, options?: {}): Observable<T> {
        // @ts-ignore
        return this._http.put<T>(this._api + url, body, {
            ...this._httpOptions,
            ...options
        });
    }

    delete<T>(url: string, body?: any, options?: {}): Observable<T> {
        // @ts-ignore
        return this._http.delete<T>(this._api + url, {
            body: body,
            ...this._httpOptions,
            ...options
        });
    }

    private _handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `,
                error.error
            );
        }
        // Return an observable
        return throwError(
            () => new Error('Something went wrong; please try again later.')
        );
    }
}
