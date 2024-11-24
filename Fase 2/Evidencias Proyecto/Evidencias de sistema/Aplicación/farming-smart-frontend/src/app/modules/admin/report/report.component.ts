import {AfterViewInit, Component, ViewChild, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutV2Component} from "../layout/layout.component";
import {MatDividerModule} from "@angular/material/divider";
import {MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import moment from "moment";
import {MatNativeDateModule} from "@angular/material/core";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {FuseAlertComponent} from "../../../../@fuse/components/alert";
import {DataService} from "../../../shared/services/data.service";
import {environment} from "../../../../environments/environment";
import {SnackbarService} from "../../../shared/services/snackbar/snackbar.service";

@Component({
    selector: 'report',
    standalone: true,
    imports: [
        CommonModule, LayoutV2Component,
        MatDividerModule, MatCardModule,
        MatDatepickerModule, MatFormFieldModule, MatButtonModule,
        ReactiveFormsModule,
        MatNativeDateModule, MatTooltipModule, MatInputModule,
        MatIconModule, FuseAlertComponent
    ],
    templateUrl: './report.component.html',
})
export class ReportComponent implements AfterViewInit {
    @ViewChild('button') button: MatButton;
    max: Date;
    min: Date;
    range: FormGroup;
    email = new FormControl('', [Validators.required, Validators.email]);
    dataService = inject(DataService);
    snackbarService = inject(SnackbarService);

    constructor() {
        this.max = new Date();
        this.min = moment().subtract(7, 'days').toDate();
        this.range = new FormGroup({
            start: new FormControl<Date | null>(null, [Validators.required]),
            end: new FormControl<Date | null>(null, [Validators.required]),
        });
    }

    ngAfterViewInit(): void {
        this.range.valueChanges.subscribe({
            next: (value) => {
                const start = moment(value.start).format();
                const end = moment(value.end).format();
                if (this.validate(start, end)) {
                } else {
                    this.range.setErrors({invalid: true});
                }
            }
        })
    }

    validate(start: string, end: string): boolean {
        if (!start || !end) {
            return false;
        }
        return moment(start).isBefore(end) && moment(end).diff(moment(start), 'days') >= 2
            && moment(end).diff(moment(start), 'days') <= 6;
    }


    send(): Promise<void> {
        this.button.disabled = true;
        return new Promise<void>((resolve, reject) => {
            this.dataService.postModified(environment.reportUrl + 'v1/generate-report', this._createBody()).subscribe({
                next: (_) => {
                    const message = `Reporte enviado correctamente a ${this.email.value}`;
                    this.snackbarService.show(message, false);
                    this.button.disabled = false;
                    resolve();
                },
                error: (error) => {
                    console.error(error);
                    this.snackbarService.show('Error al enviar el reporte', true);
                    this.button.disabled = false;
                    reject();
                }
            })
        });
    }

    private _createBody(): {} {
        return {
            start_date: moment(this.range.value.start).format('YYYY-MM-DD'),
            end_date: moment(this.range.value.end).format('YYYY-MM-DD'),
            correo: this.email.value
        }
    }

}
