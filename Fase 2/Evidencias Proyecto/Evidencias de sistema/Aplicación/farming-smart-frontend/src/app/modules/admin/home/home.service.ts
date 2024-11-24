import {Injectable} from '@angular/core';
import {formatDateToISO} from "../../../shared/utils/date";
import {Subject} from "rxjs";
import {ITimeList} from "./home.interface";

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    params: string = '';
    timeValue: ITimeList = {
        label: 'Hace 1 hora',
        value: 1,
        type: 'hr'
    };
    status$: Subject<string>;
    open: '' | 'manual' | 'realtime' = '';
    lastUsed: 'manual-list' | 'manual-custom' | 'realtime-list' | 'realtime-custom' | 'empty' = 'manual-list';
    disableRefresh = false;
    lastUsed$: Subject<string>;

    constructor() {
        this.status$ = new Subject<string>();
        this.lastUsed$ = new Subject<string>();
    }


    createParams(options: {
        startTime: Date,
        endTime: Date,
    }): void {
        this.params = `?start_time=${formatDateToISO(options.startTime)}&end_time=${formatDateToISO(options.endTime)}`;
    }

    getDisabled(): boolean {
        return this.lastUsed === 'realtime-list' || this.lastUsed === 'realtime-custom';
    }

    getIndex(ranges: ITimeList[]): number {
        return ranges.findIndex((range) => range.value === this.timeValue.value);
    }
}
