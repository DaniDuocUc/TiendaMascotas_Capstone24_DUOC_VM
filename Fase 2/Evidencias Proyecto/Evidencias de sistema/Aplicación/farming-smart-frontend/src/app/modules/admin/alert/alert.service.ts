import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    indexTab: number = 0;

    constructor() {
    }
}
