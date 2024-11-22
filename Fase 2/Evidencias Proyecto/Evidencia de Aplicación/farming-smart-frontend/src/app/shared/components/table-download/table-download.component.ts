import {Component, ElementRef, signal, ViewChild, WritableSignal} from "@angular/core";
import {MatTableDataSource} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {utils, WorkBook, WorkSheet, writeFileXLSX} from "xlsx";
import {NgClass} from "@angular/common";

@Component({
    selector: 'table-download',
    standalone: true,
    template: `
        <button #button [disabled]="button.disabled" mat-stroked-button color="primary"
                [class]="'flex gap-x-2 ' + class"
                [ngClass]="{
                    'mat-button-disabled': button.disabled
                }"
                (click)="download()">
            <span class="dark:text-white">{{ label }}</span>
            <mat-icon color="primary" class="dark:!text-white">download</mat-icon>
        </button>
    `,
    imports: [MatIconModule, MatButtonModule, NgClass],
    inputs: [
        {
            name: 'dataSource',
            required: true
        },
        {
            name: 'label',
            required: true
        },
        {
            name: 'class',
            required: false
        }, {
            name: 'tab',
            required: false
        }, {
            name: 'filename',
            required: true
        }
    ]
})
export class TableDownloadComponent {
    //-----------------
    // @ Inputs
    public dataSource!: MatTableDataSource<any>;
    public label!: string;
    public class!: string;
    public tab: string = 'cost';
    public filename: WritableSignal<string>;
    //-----------------
    // @ View child
    @ViewChild('button') button!: MatButton;

    constructor() {
    }

    public download(): void {
        try {
            this.button.disabled = true;
            // generate worksheet
            const ws: WorkSheet = utils.json_to_sheet(this.dataSource.filteredData);
            // generate workbook and add the worksheet
            const wb: WorkBook = utils.book_new();
            utils.book_append_sheet(wb, ws, this.tab);
            // save to file
            writeFileXLSX(wb, this.filename(), {compression: true});
            this.button.disabled = false;
        } catch (err) {
            this.button.disabled = false;
            // alert to show error
        }
    }
}
