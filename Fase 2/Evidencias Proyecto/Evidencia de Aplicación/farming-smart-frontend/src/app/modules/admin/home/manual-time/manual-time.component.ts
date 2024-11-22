import {AfterViewInit, Component, inject, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatMenu, MatMenuModule} from "@angular/material/menu";
import {MatListModule, MatSelectionList} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {Subject, takeUntil} from "rxjs";
import {HomeService} from "../home.service";
import {combineDateAndTime, subtractTime} from "../../../../shared/utils/date";
import {ITimeList} from "../home.interface";

@Component({
    selector: 'manual-time',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatMenuModule, MatListModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatInputModule],
    templateUrl: './manual-time.component.html',
    styles: []
})
export class ManualTimeComponent implements AfterViewInit, OnDestroy {
    @ViewChild('menu') menu: MatMenu;
    @ViewChild('list') list: MatSelectionList;
    hiddenDate = true;
    form: FormGroup;
    ranges: ITimeList[] = [
        {
            label: 'Hace 1 minuto',
            value: 60,
            type: 'seg'
        },
        {
            label: 'Hace 30 minutos',
            value: 30,
            type: 'min'
        },
        {
            label: 'Hace 1 hora',
            value: 1,
            type: 'hr'
        },
        {
            label: 'Hace 4 horas',
            value: 4,
            type: 'hr'
        },
        {
            label: 'Hace 8 horas',
            value: 8,
            type: 'hr'
        },
        {
            label: 'Hace 12 horas',
            value: 12,
            type: 'hr'
        },
        {
            label: 'Hace 24 horas',
            value: 24,
            type: 'hr'
        },
        {
            label: 'Personalizado',
            value: 0
        },
    ];
    maxDate = new Date();
    maxStartDate = new Date();
    public homeService = inject(HomeService);
    private _unsubscribeAll: Subject<void>;

    constructor() {
        this._unsubscribeAll = new Subject();
        this.form = new FormGroup({
            'startDate': new FormControl(new Date(), [
                Validators.required,
            ]),
            'endDate': new FormControl(new Date(), [
                Validators.required
            ]),
            'startHour': new FormControl('00:00', [
                Validators.required
            ]),
            'endHour': new FormControl('23:59', [
                Validators.required
            ]),
        });
    }

    ngAfterViewInit() {
        this.form.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(
                {
                    next: (value) => {
                        if (value.startDate > value.endDate) {
                            this.form.get('startDate').setValue('', {emitEvent: false});
                        }
                    }
                }
            )
        this.form.get('endDate').valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(
                {
                    next: (value) => {
                        this.form.get('startDate').setValue('', {emitEvent: false});
                        this.form.get('startHour').setValue('00:00', {emitEvent: false});
                        this.maxStartDate = value;
                    }
                }
            )
        this.menu.overlayPanelClass = 'custom-panel';
        this.list._items.get(this.homeService.getIndex(this.ranges)).selected = true;
        this.list.selectionChange
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (item: any) => {
                    const value = item.source._value[0].value;
                    this.hiddenDate = value !== 0;
                }
            })
        this.homeService.lastUsed$
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (value) => {
                    if (value === 'empty') {
                        this.save();
                    }
                }
            })
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.list._items.get(this.homeService.getIndex(this.ranges)).selected = true;
    }


    cancel() {
        this.list._items.get(this.homeService.getIndex(this.ranges)).selected = true;
        this.hiddenDate = this.homeService.getIndex(this.ranges) !== 8;
        this.homeService.open = '';
        this.menu.close.emit('click');
    }


    save() {
        const value: ITimeList = this.list.selectedOptions.selected[0].value;
        if (this.hiddenDate) {
            const startTime = subtractTime(value.value, value.type);
            const endTime = new Date();
            this.homeService.createParams({startTime, endTime});
            this.homeService.lastUsed = 'manual-list';
        } else {
            const start = new Date(this.form.get('startDate').value);
            const end = new Date(this.form.get('endDate').value);
            const startHour = this.form.get('startHour').value;
            const endHour = this.form.get('endHour').value;
            const startTime = combineDateAndTime(start, startHour);
            const endTime = combineDateAndTime(end, endHour);
            this.homeService.createParams({startTime, endTime});
            this.homeService.lastUsed = 'manual-custom';
        }
        this.homeService.open = '';
        this.homeService.timeValue = value;
        this.homeService.status$.next('manual');
        this.menu.close.emit('click');
    }

}
