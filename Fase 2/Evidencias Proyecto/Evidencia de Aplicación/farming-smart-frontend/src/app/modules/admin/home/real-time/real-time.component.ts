import {AfterViewInit, Component, inject, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatListModule, MatSelectionList} from "@angular/material/list";
import {MatMenu, MatMenuModule} from "@angular/material/menu";
import {Subject, takeUntil} from "rxjs";
import {ITimeList} from "../home.interface";
import {convertToSeconds} from "../../../../shared/utils/date";
import {HomeService} from "../home.service";
import {MatSelectModule} from "@angular/material/select";
import {SocketService} from "../../../../shared/services/socket/socket.service";

@Component({
    selector: 'real-time',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatListModule, MatMenuModule, ReactiveFormsModule, MatSelectModule],
    templateUrl: './real-time.component.html',
    styles: []
})
export class RealTimeComponent implements AfterViewInit, OnDestroy {
    @ViewChild('menu') menu: MatMenu;
    @ViewChild('list') list: MatSelectionList;
    hiddenRelative = true;
    form: FormGroup;
    ranges: ITimeList[] = [
        {
            label: 'Desactivar',
            value: -1,
            type: 'empty'
        },
        {
            label: 'Hace 1 minuto',
            value: 1,
            type: 'min'
        },
        {
            label: 'Hace 5 minutos',
            value: 5,
            type: 'min'
        },
        {
            label: 'Hace 15 minutos',
            value: 15,
            type: 'min'
        },
        {
            label: 'Hace 25 minutos',
            value: 20,
            type: 'min'
        },
        {
            label: 'Personalizado',
            value: 0
        },
    ];
    homeService = inject(HomeService);
    socketService = inject(SocketService);
    isActivated = false;
    private _unsubscribeAll = new Subject<void>();

    constructor() {
        this.form = new FormGroup({
            value: new FormControl(60, [
                Validators.required,
            ]),
            type: new FormControl('seg', [
                Validators.required,
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
                    next: (res) => {
                        const value = res.value;
                        const unit = res.type;

                        if (isNaN(value) || value <= 0) {
                            return;
                        }
                        const seconds = convertToSeconds(value, unit);
                        // Check if the value in seconds exceeds 24 hours (86400 seconds)
                        if (seconds > 86400) {
                            this.form.get('value').setErrors({maxValue: true});
                        } else if (seconds < 60) {
                            this.form.get('value').setErrors({minValue: true});
                        } else {
                            this.form.get('value').setErrors(null);
                        }
                    }
                }
            )
        if (this.homeService.getIndex(this.ranges) !== -1) {
            this.list._items.get(this.homeService.getIndex(this.ranges)).selected = true;
        }
        this.menu.overlayPanelClass = 'custom-panel';
        this.list.selectionChange
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (item: any) => {
                    const value = item.source._value[0].value;
                    this.hiddenRelative = value !== 0;
                }
            })
        this.socketService.connected$
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (connected) => {
                    console.log('Connected | realtime', connected);
                    if (!connected) {
                        if (this.homeService.lastUsed === 'realtime-list' || this.homeService.lastUsed === 'realtime-custom') {
                            this.homeService.lastUsed = 'empty';
                            this.homeService.open = '';
                        }
                        this.isActivated = false;
                    }
                }
            })
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    cancel() {
        if (this.homeService.getIndex(this.ranges) !== -1) {
            this.list._items.get(this.homeService.getIndex(this.ranges)).selected = true;
            this.hiddenRelative = this.homeService.getIndex(this.ranges) !== 6;
        }
        this.homeService.open = '';
        this.menu.close.emit('click');
    }

    save() {
        const value: ITimeList = this.list.selectedOptions.selected[0].value;
        let seconds = '60';
        if (value.value === -1) {
            this.socketService.sendMessage({
                command: "stopUpdates",
                seconds: seconds
            });
            this.homeService.lastUsed = 'empty';
            this.homeService.lastUsed$.next('empty');
            this.homeService.open = '';
            this.isActivated = false;
            this.menu.close.emit('click');
            return;
        }

        if (this.hiddenRelative) {
            seconds = convertToSeconds(value.value, value.type).toString();
            this.homeService.lastUsed = 'realtime-list';
        } else {
            seconds = convertToSeconds(this.form.get('value').value, this.form.get('type').value).toString();
            this.homeService.lastUsed = 'realtime-custom';
        }

        this.homeService.timeValue = value;
        this.socketService.sendMessage({
            command: "startUpdates",
            seconds: seconds
        })
        this.isActivated = true;
        this.homeService.open = '';
        this.menu.close.emit('click');
    }


}
