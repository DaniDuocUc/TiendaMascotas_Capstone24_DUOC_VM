import {AfterViewInit, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldAppearance, MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {TranslocoModule} from "@ngneat/transloco";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {IConfigV2, ISelectOption, ISelectValue} from "./generic-select.interface";

@Component({
    selector: 'generic-select-v2',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, TranslocoModule, ReactiveFormsModule],
    templateUrl: './generic-select.component.html',
    styles: []
})
export class GenericSelectComponent implements AfterViewInit {
    @Input({
        required: true,
    }) config: IConfigV2;
    @Input() hasTransloco: boolean = false;
    @Input() customClass: string = '';
    @Input() appearance: MatFormFieldAppearance = 'outline';
    @Input() pipe: 'uppercase' | 'lowercase' | 'titlecase' | 'none' = 'titlecase';
    @Input() values: ISelectValue[] = [];
    valuesFiltered: ISelectValue[] = [];
    formControl: FormControl;
    hasMarkedAll: boolean = false;
    show: boolean = false;

    ngAfterViewInit() {
        this.show = true;
        this.formControl = new FormControl('');
        if (this.config.values) {
            this.loadValues(this.config.values);
        }
    }


    verifyAllSelectedByKey(key: string, options?: ISelectOption) {
        if (this.formControl?.value?.some((item: any) => item[key] === 'all') && !this.hasMarkedAll) {
            this.selectAll(options);
        } else {
            this.deselectAll(options);
        }
    }

    removeValueByKey(key: string, value: string, options?: ISelectOption): void {
        let newValues = this.formControl.value.filter((item: any) => item[key] !== value);
        this.hasMarkedAll = false;
        this.formControl.setValue(newValues, options)
    }

    selectAll(options: ISelectOption): void {
        const newValues = [...this.values];
        newValues.push(this.config.all);
        this.formControl.setValue(newValues, options)
        this.hasMarkedAll = true;
    }

    deselectAll(options?: ISelectOption): void {
        this.hasMarkedAll = false;
        this.formControl.setValue([], options)
    }

    loadValues(values: ISelectValue[]) {
        this.values = values;
        this.valuesFiltered = values
    }

    addValue(value: string, options?: ISelectOption): void {
        const item = this.values.find((item: ISelectValue) => item.label === value);
        this.formControl.setValue(item, options)
    }
}
