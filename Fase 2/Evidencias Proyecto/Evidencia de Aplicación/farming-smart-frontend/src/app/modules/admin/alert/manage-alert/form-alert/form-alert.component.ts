import {AfterViewInit, Component, inject, Inject, ViewChildren} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {GenericSelectComponent} from "../../../../../shared/components/v2/generic-select";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {IFormAlert} from "./form-alert.interface";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {conditions, metrics, operators, products, status} from "../data";
import {IPostAlert} from "../edit-alert";

@Component({
    selector: 'form-alert',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, GenericSelectComponent, MatInputModule, MatDividerModule, ReactiveFormsModule, MatChipsModule, MatIconModule],
    templateUrl: './form-alert.component.html',
    styles: []
})
export class FormAlertComponent implements AfterViewInit {
    @ViewChildren(GenericSelectComponent) selects: GenericSelectComponent[];
    config: IFormAlert;
    form: FormGroup = new FormGroup({});
    email: FormControl = new FormControl('');
    private _dialogRef = inject(MatDialogRef<FormAlertComponent>);

    constructor(@Inject(MAT_DIALOG_DATA) data: IFormAlert) {
        this.config = data;
        this.buildForm();
    }

    ngAfterViewInit(): void {
        this.populate();
        if (this.config.type === 'create') {
            this.form.get('product_name')?.setValue(products[0]);
            this.form.get('condition')?.setValue(conditions[0]);
            this.form.get('operator')?.setValue(operators[0]);
            this.form.get('metric')?.setValue(metrics[0]);
        }
    }

    save(): void {
        this._dialogRef.close({
            status: 'save',
            data: this.serialize()
        });
    }

    close(): void {
        this._dialogRef.close({
            status: 'cancel',
            data: null
        })
    }


    serialize(): IPostAlert {
        return {
            product_id: this.form.get('product_name')?.value.id || 0,
            name: this.form.get('alert_name')?.value,
            condition: this.form.get('condition')?.value.value,
            operator: this.form.get('operator')?.value.value,
            metric: this.form.get('metric')?.value.value,
            threshold: this.form.get('threshold')?.value,
            time_window: this.form.get('time_window')?.value,
            emails: this.form.get('emails')?.value.length === 1 ? this.form.get('emails')?.value[0] : this.form.get('emails')?.value.join(','),
            status: this.config.type === 'edit' ? this.form.get('status')?.value.value === 'Activa' : true
        }
    }


    buildForm(): void {
        this.form = new FormGroup({
            product_name: new FormControl('', [Validators.required]),
            alert_name: new FormControl(this.config.alert?.alert_name, [Validators.required]),
            condition: new FormControl('', [Validators.required]),
            operator: new FormControl('', [Validators.required]),
            threshold: new FormControl(this.config.alert?.threshold, [Validators.required]),
            time_window: new FormControl(this.config.alert?.time_window, [Validators.required, Validators.max(1440), Validators.min(1)]),
            emails: new FormControl(this.config.alert?.custom_emails, [Validators.required]),
        });
        if (this.config.type === 'edit') {
            this.form.addControl('status', new FormControl('', [Validators.required]));
        } else {
            this.form.get('emails')?.setValue([]);
        }
        this.form.markAsUntouched();
    }

    populate(): void {
        this.selects.forEach(select => {
            this.form = new FormGroup({
                ...this.form.controls,
                [select.config.name]: select.formControl
            });
            if (this.config.type === 'edit') {
                select.addValue(this.config.alert[select.config.name]);
            }
        });
    }

    remove(keyword: string) {
        const index = this.form.get('emails')?.value.indexOf(keyword);
        if (index >= 0) {
            this.form.get('emails')?.value.splice(index, 1);
        }
        if (this.form.get('emails')?.value.length === 0) {
            this.form.get('emails')?.setValue([]);
        }
        this.form.markAsUntouched();
    }

    validate(value: string): boolean {
        if (this.form.get('emails')?.value.includes(value)) {
            return;
        }
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return regex.test(value) && value !== '';

    }

    addFromChip(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (this.validate(value)) {
            this.form.get('emails')?.setValue([...this.form.get('emails')?.value, value]);
            // Clear the input value
            event.chipInput!.clear();
        }
    }


    add(value: string): void {
        if (this.validate(value)) {
            this.form.get('emails')?.setValue([...this.form.get('emails')?.value, value]);
            this.email.setValue('');
        }
    }

    protected readonly products = products;
    protected readonly conditions = conditions;
    protected readonly operators = operators;
    protected readonly status = status;
    protected readonly metrics = metrics;
}
