import {AfterViewInit, Component, Input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldAppearance, MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {IConfig, SelectClass} from "../../classes/select";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslocoModule} from "@ngneat/transloco";

@Component({
    selector: 'generic-select',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, TranslocoModule],
    templateUrl: './select.component.html',
    exportAs: 'generic-select'
})
export class GenericSelectComponent implements AfterViewInit {
    @Input() config: IConfig;
    @Input() hasFormGroup: boolean = false;
    @Input() hasTransloco: boolean = false;
    @Input() emitEvent: boolean = false;
    @Input() classes: string = '';
    @Input() appearance: MatFormFieldAppearance = 'outline';
    @Input() pipe: 'uppercase' | 'lowercase' | 'titlecase' | 'none' = 'none';
    select: SelectClass<any>;
    show = signal<boolean>(false);

    ngAfterViewInit() {
        this.select = new SelectClass<any>(this.config);
        this.show.set(true);
    }

    disable() {
        this.select.formControl.disable({
            emitEvent: false
        });
    }

    enable(): void {
        this.select.formControl.enable({
            emitEvent: false
        });
    }

    reset(options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
        emitModelToViewChange?: boolean;
        emitViewToModelChange?: boolean;
    }): void {
        this.select.formControl.setValue([], options);
    }

    validateAll(): void {
        const values = this.select.formControl.value;
        const lists = this.select.values;
        const flag = values.length === lists.length;
        if (flag) {
            // insert to item all
            this.select.formControl.setValue([
                ...values,
                this.select.config.all
            ], {
                emitEvent: false
            });
        }
    }
}
