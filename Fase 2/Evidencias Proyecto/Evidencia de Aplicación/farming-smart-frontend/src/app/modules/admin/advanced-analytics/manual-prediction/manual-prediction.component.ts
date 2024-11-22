import {AfterViewInit, Component, effect, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSelectModule} from "@angular/material/select";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {BasePredictionComponent} from "../base-prediction";

@Component({
    selector: 'manual-prediction',
    standalone: true,
    imports: [CommonModule, MatSelectModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, BasePredictionComponent],
    templateUrl: './manual-prediction.component.html',
    styles: []
})
export class ManualPredictionComponent implements AfterViewInit {
    @ViewChild('button') button: MatButton;
    @ViewChild('basePrediction') basePrediction: BasePredictionComponent;
    devices: any[] = [
        {
            label: 'IoT N° 1',
            id: '1'
        }
    ]
    form: FormGroup;

    showPrediction: boolean = false;


    get device() {
        return String(this.form.get('device').value);
    }

    get soilHumidity() {
        return String(this.form.get('soilHumidity').value);
    }

    constructor() {
        this.form = new FormGroup({
            device: new FormControl(this.devices[0].id, [Validators.required]),
            soilHumidity: new FormControl(70, [Validators.required, Validators.min(0), Validators.max(100)]),
        });
        this.form.valueChanges.subscribe({
            next: (value) => {
                console.log(value);
            }
        })
    }

    ngAfterViewInit() {
        this.basePrediction.status$.subscribe({
            next: (value) => {
                console.log(value);
                if (this.showPrediction) {
                    if (value === 'completed') {
                        this.button.disabled = false;
                        this.form.enable();
                    }
                }
            }
        })

    }

    predict() {
        this.button.disabled = true;
        this.showPrediction = true;
        this.form.disable();
        this.basePrediction.soilHumidity = this.soilHumidity;
        this.basePrediction.deviceId = this.device;
        this.basePrediction.predict().finally(() => {
        });
    }
}
