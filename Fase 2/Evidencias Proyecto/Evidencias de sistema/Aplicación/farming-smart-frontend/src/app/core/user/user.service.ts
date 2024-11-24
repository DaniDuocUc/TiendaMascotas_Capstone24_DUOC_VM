import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {IUser, User} from 'app/core/user/user.types';
import {map, Observable, ReplaySubject, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserService {
    userValue: IUser;
    private _user: ReplaySubject<IUser> = new ReplaySubject<IUser>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: IUser) {
        // Store the value
        this.userValue = value;
        this._user.next(value);
    }

    get user$(): Observable<IUser> {
        return this._user.asObservable();
    }


}
