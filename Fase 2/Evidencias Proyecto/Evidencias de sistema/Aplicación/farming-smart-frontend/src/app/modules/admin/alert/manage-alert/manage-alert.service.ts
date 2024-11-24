import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ManageAlertService {
    status$: Subject<string>;

    constructor() {
        this.status$ = new Subject<string>();
    }
}
