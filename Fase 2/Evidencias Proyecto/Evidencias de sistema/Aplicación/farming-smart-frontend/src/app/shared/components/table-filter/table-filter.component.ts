import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {ListUtils} from "../../utils/list.utils";
import {TranslocoModule} from "@ngneat/transloco";
import moment from "moment";
import {IItemFilter} from "./table-filter.interface";


@Component({
    selector: 'table-filter',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule, MatIconModule, TranslocoModule],
    templateUrl: './table-filter.component.html',
    exportAs: 'tableFilter'
})
export class TableFilterComponent implements OnInit, AfterViewInit {
    @Input() dataSource: MatTableDataSource<any> | undefined;
    @Input() items: IItemFilter[] = [];
    @Input() class?: string = 'flex justify-end';
    @Input() predicateMethod?: (item: any, filter: any) => boolean;
    @Input() filterCustom?: any[] = [];
    formGroup: FormGroup;


    constructor() {
        this.formGroup = new FormGroup({});
    }

    ngOnInit() {
        this.buildFormGroup();
    }

    ngAfterViewInit() {
        this.reloadPredicate();
        this.formGroup.valueChanges.subscribe((value: any) => {
            this.applyFilter();
        });
        setTimeout(() => {
            this.populateFilters();
        }, 2000)
    }


    reloadPredicate(): void {
        if (this.predicateMethod) {
            this.dataSource.filterPredicate = this.predicateMethod;
        } else if (this.dataSource) {
            this.dataSource.filterPredicate = this.predicate;
        }
    }


    applyFilter(): void {
        const filters = Object.keys(this.formGroup.value).map((key: string) => {
            return {
                name: key,
                value: this.formGroup.value[key],
                columns: this.items.find((item: IItemFilter) => item.name === key)?.columns
            };
        });
        if (this.filterCustom.length === 0) {
            this.dataSource.filter = JSON.stringify(filters);
        } else {
            const union = [...filters, ...this.filterCustom];
            this.dataSource.filter = JSON.stringify(union);
        }

    }

    buildFormGroup(): void {
        this.items.forEach((item: IItemFilter) => {
            this.formGroup.addControl(item.name, new FormControl());
        });
    }


    predicate(item: any, filter: string): boolean {
        const filters: any[] = JSON.parse(filter);
        const flags = filters.reduce((acc: any, f: any) => {
            acc[f.name] = false;
            return acc;
        }, {});
        filters.forEach((f: any) => {
            if (f['value'] === null) {
                flags[f.name] = true;
                return;
            }

            if (f.name === 'search') {
                flags[f.name] =
                    f.columns?.some((column: string) => String(item[column]).toLowerCase().includes(String(f.value).toLowerCase())) || !f.value;
            } else if (f.type === 'custom') {
                // Logic
                if (f.logic === 'date - between') {
                    if (!f.value[0]) {
                        flags[f.name] = true;
                        return;
                    }
                    const dateItem = moment(item[f.columns[0]]).format('YYYY-MM-DD');
                    const dateStart = f.value[0]
                    const dateEnd = f.value[1]
                    flags[f.name] = moment(dateItem).isBetween(dateStart, dateEnd, undefined, '[]') || !f.value;
                }
            } else if (typeof f.value === 'string') {
                flags[f.name] =
                    f.columns?.every((column: string) => String(item[column]).toLowerCase() === String(f.value).toLowerCase()) || !f.value;
            } else if (typeof f.value === 'object') {
                if (f.value?.length === 0) {
                    flags[f.name] = true;
                    return;
                }
                flags[f.name] =
                    f.columns.some((column: string) => {
                        // Values are arrays
                        if (typeof f['value'][0] === 'object') {
                            return item[column]?.some((value: string) => f?.value?.flat()?.includes(value));
                        }
                        // Item[column] is an object, for example : {anomaly: ['PNN', 'PMC']}
                        else if (typeof item[column] === 'object') {
                            return item[column]?.some((value: string) => f?.value?.includes(value));
                        }

                        // Values are strings
                        return f.value?.includes(item[column]);
                    }) || !f.value;

            }


        });
        // @ts-ignore
        return Object.values(flags).every((flag: boolean) => flag);
    }

    loadForm(positionItem: number, options: {
        key: string;
        typeList: 'unique' | 'uniqueBy' | 'uniqueByArray';
    }): void {
        let data = [];
        if (options.typeList === 'unique') {
            data = ListUtils.unique(this.dataSource.data.map(item => item[options.key]));
        } else {
            data = ListUtils[options.typeList](this.dataSource.data, options.key);
        }
        this.items[positionItem].values = data.map((item: any) => {
            return {
                name: item[options.key],
                label: item[options.key],
                value: item[options.key]
            }
        });
    }


    removeFilter(name: string, type: 'custom' | 'form'): void {
        const index = this.filterCustom.findIndex((item: any) => item.name === name);
        if (index !== -1) {
            this.filterCustom.splice(index, 1);
        }
        if (type === 'form') {
            this.formGroup.get(name)?.setValue('');
        }
        this.applyFilter();
    }

    loadFilter(key: string): {
        name: string;
        label: string;
        value: string[];
    }[] {
        const data = ListUtils.unique(this.dataSource.data.map(item => item[key]));
        return data.map((item: any) => ({
            name: item,
            label: item,
            value: item
        }));
    }

    populateFilters(): void {
        const selects = this.items.filter(item => item.name !== 'search');
        selects.forEach((item) => {
            item.values = this.loadFilter(item.columns[0]);
        });
    }

}
