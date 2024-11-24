import {AfterViewInit, Component, inject, Input, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IColumn, TableComponent} from "../../../../shared/components/table";
import {IItemFilter, TableFilterComponent} from "../../../../shared/components/table-filter";
import {TablePaginatorComponent} from "../../../../shared/components/table-paginator/table-paginator.component";
import {DataService} from "../../../../shared/services/data.service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TruncateStrPipe} from "../../../../shared/pipes/truncate-str.pipe";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {EditAlertComponent} from "./edit-alert";
import {DeleteAlertComponent} from "./delete-alert";
import {CreateAlertComponent} from "./create-alert";
import {IPaginatedAlert} from "./manage-alert.interface";
import {ManageAlertService} from "./manage-alert.service";
import {Subject, takeUntil} from "rxjs";

@Component({
    selector: 'manage-alert',
    standalone: true,
    imports: [CommonModule, TableComponent, TableFilterComponent, TablePaginatorComponent, MatTooltipModule, TruncateStrPipe, MatMenuModule, MatButtonModule, MatIconModule, EditAlertComponent, DeleteAlertComponent, TableFilterComponent, CreateAlertComponent],
    templateUrl: './manage-alert.component.html',
    styles: []
})
export class ManageAlertComponent implements AfterViewInit, OnDestroy {
    @ViewChild('filter') filter: TableFilterComponent;
    @ViewChild('table') table: TableComponent;
    @Input({
        required: true,
    }) columns: IColumn[] = [];
    @Input({
        required: true,
    }) path: string = '';
    @Input() create: boolean = false;
    @Input() itemsFilter: IItemFilter[] = [];
    response: IPaginatedAlert = {
        page_size: 10,
        request_time: '',
        current_page: 0,
        total_pages: 0,
        total_alerts: 0,
        total_triggered_alerts: 0,
        alerts: []
    };
    private _dataService = inject(DataService);
    private _manageAlertService = inject(ManageAlertService);
    private _unsubscribeAll = new Subject<void>();

    async ngAfterViewInit(): Promise<void> {
        this.itemsFilter[0].columns = this.columns.filter((column: IColumn) => column.type !== 'action').map((column: IColumn) => column.property);
        await this.getData(this.path);
        this._manageAlertService.status$
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (status: string) => {
                    if (status === 'refresh') {
                        this.getData(this.path).finally();
                        this.filter.ngAfterViewInit();
                    }
                }
            })
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    getData(endpoint: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._dataService.get(endpoint).subscribe(
                {
                    next: (response: IPaginatedAlert) => {
                        this.analyze(response);
                        this.table.loadData(response.alerts);
                        resolve();
                    },
                    error: (error: any) => {
                        reject(error);
                    }
                }
            );
        });
    }

    analyze(response: IPaginatedAlert): void {
        this.response.request_time = response.request_time;
        this.response.current_page = response.current_page;
        this.response.total_pages = response.total_pages;
        if (this.create) {
            this.response.total_alerts = response.total_alerts;
        } else {
            this.response.total_triggered_alerts = response.total_triggered_alerts;
        }
    }

    listen(event: any): void {
        const queryParams = `${this.path}?page=${event.pageIndex + 1}&limit=${event.pageSize}`;
        this.getData(queryParams).finally();
    }

}
