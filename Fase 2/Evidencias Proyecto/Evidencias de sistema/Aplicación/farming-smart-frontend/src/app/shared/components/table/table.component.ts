import {
    AfterViewInit,
    Component, EventEmitter,
    Input, Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {typeColumn} from "./table.types";
import {TranslocoModule} from "@ngneat/transloco";
import {MatPaginatorModule} from "@angular/material/paginator";

export interface IColumn {
    label: string;
    property: string;
    type: typeColumn;
    visible?: boolean;
    disabled?: boolean;
    class?: string;
}


@Component({
    selector: 'table-basic',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatSortModule, TranslocoModule, MatPaginatorModule],
    templateUrl: './table.component.html',
    exportAs: 'tableBasic'
})
export class TableComponent implements AfterViewInit {
    @Input() hasSort: boolean = false;
    @Input() hasSelectedRow: boolean = false;
    @Input({
        required: true
    }) columns: IColumn[] = [];
    @Input() class: string = '';
    @Input() action: TemplateRef<any> | undefined;
    @Input() custom: TemplateRef<any> | undefined;
    @Input() rowSelectedClass: string = '';
    @Output() onSelectedRow: EventEmitter<any>;
    dataSource: MatTableDataSource<any>;
    selectedRow: any;
    @ViewChild(MatSort) sort: MatSort | undefined;

    constructor() {
        this.dataSource = new MatTableDataSource<any>();
        this.onSelectedRow = new EventEmitter<any>();
    }

    ngAfterViewInit() {
        if (this.hasSort) {
            this.dataSource.sort = this.sort!;
        }
    }


    get displayedColumns(): string[] {
        return this.columns
            .filter(column => column.visible !== false)
            .map(column => column.property)
    }

    loadData(data: any[]): void {
        this.dataSource.data = data;
    }

    selectRow(row: any): void {
        if (this.selectedRow === row) {
            return;
        }
        this.selectedRow = row;
        this.onSelectedRow.emit(row);
    }
}
