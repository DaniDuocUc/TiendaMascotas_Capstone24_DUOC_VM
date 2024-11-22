import {FormControl, Validators} from "@angular/forms";

export interface IConfig {
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    selectAll?: boolean;
    selectAllLabel?: string;
    options?: any[];
    all?: any;
}

export class SelectClass<T> {
    values: T[] = [];
    valuesFiltered: T[] = [];
    formControl: FormControl;
    hasMarkedAll: boolean = false;

    constructor(
        public config: IConfig
    ) {
        this.formControl = new FormControl('');
        this.formControl.setValidators(config?.required ? Validators.required : null);
        if (config?.disabled) {
            this.formControl.disable();
        }
    }


    setConfig(config: IConfig): void {
        this.config = config;
        this.formControl.setValidators(config?.required ? Validators.required : null);
        if (config?.disabled) {
            this.formControl.disable();
        }
    }

    /**
     *
     * @param values
     * @description Load values to list select
     */
    loadValues(values: T[]) {
        this.values = values;
        this.valuesFiltered = values;
    }

    verifyAllSelected(key: string, options: any): void {
        if (this.formControl.value.includes('all') && !this.hasMarkedAll) {
            this.loadAll(key, options)
        } else {
            this.deselectAll(options)
        }
    }

    verifyAllSelectedByKey(key: string, options: any): void {
        if (this.formControl.value.some((item: any) => item[key] === 'all') && !this.hasMarkedAll) {
            const newValues = [...this.values];
            // @ts-ignore
            newValues.push(this.config.all);
            this.formControl.setValue(newValues, options)
            this.hasMarkedAll = true;
        } else {
            this.deselectAll(options)
        }
    }

    loadAll(key: string, options: any): void {
        // @ts-ignore
        let newValues = this.values.map((item) => item[key]) as string[];
        newValues.push('all')
        this.hasMarkedAll = true;
        this.formControl.setValue(newValues, options)
    }

    deselectAll(options?: any): void {
        this.hasMarkedAll = false;
        this.formControl.setValue([], options)
    }

    removeValue(value: string, options?: any): void {
        let newValues = this.formControl.value.filter((item: string) => item !== value);
        this.hasMarkedAll = false;
        this.formControl.setValue(newValues, options)
    }

    removeValueByKey(key: string, value: string, options?: any): void {
        let newValues = this.formControl.value.filter((item: any) => item[key] !== value);
        this.hasMarkedAll = false;
        this.formControl.setValue(newValues, options)
    }


    disabledAndReset(options?: any) {
        this.formControl.disable();
        this.formControl.setValue([], options);
    }

    enableAndReset(options?: any) {
        this.formControl.enable();
        this.formControl.setValue([], options);
    }

    filterValues(filter: string | string[], key: string) {
        if (typeof filter === 'string') {
            this.valuesFiltered = this.values.filter((value: any) => {
                return value.value.toLowerCase().includes(filter.toLowerCase())
            })
        } else {
            this.valuesFiltered = this.values.filter((value: any) => {
                    return value[key].some((item: any) => {
                            return filter.includes(item)
                        }
                    )
                }
            )
        }
    }
}
