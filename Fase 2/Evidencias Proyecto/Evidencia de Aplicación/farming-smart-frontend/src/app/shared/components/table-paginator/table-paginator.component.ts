import {
    AfterViewInit,
    Component,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    signal,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {TranslocoService} from "@ngneat/transloco";
import {IPage} from "./table-paginator.interface";
import {debounceTime, Subject, takeUntil} from "rxjs";

@Component({
    selector: 'table-paginator',
    standalone: true,
    imports: [CommonModule, MatPaginatorModule],
    templateUrl: './table-paginator.component.html',
    inputs: [
        {
            name: 'class',
            required: false,
        },
        {
            name: 'dataSource',
            required: false,
        },
        {
            name: 'type',
            required: false,
        },
        {
            name: 'pageSizeOptions',
            required: false,
        },
        {
            name: 'pageSize',
            required: false,
        },
        {
            name: 'pageIndex',
            required: false,
        },
        {
            name: 'length',
            required: false,
        },
    ],
    outputs: [
        'onChangePage'
    ],
    exportAs: 'tablePaginator',
})
export class TablePaginatorComponent implements AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    class: string = 'flex justify-end';
    dataSource?: MatTableDataSource<any>;
    type: 'basic' | 'personalize' = 'basic';
    pageSizeOptions: number[] = [5, 10, 25, 100];
    pageSize: number = 5;
    pageIndex: number = 0;
    length: number = 0;
    onChangePage: EventEmitter<IPage>;
    pageSignal = signal<IPage | null>(null);
    private _translocoService = inject(TranslocoService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor() {
        this.onChangePage = new EventEmitter<IPage>();
    }


    ngAfterViewInit() {
        if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.updateLabel();
        }
        this._translocoService.langChanges$
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(500)
            )
            .subscribe((response) => {
                this.updateLabel();
            });
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    updateLabel(): void {
        this.paginator._intl.itemsPerPageLabel = this._translocoService.translate('generic.paginator.items-per-page');
        this.paginator._intl.nextPageLabel = this._translocoService.translate('generic.paginator.next-page');
        this.paginator._intl.previousPageLabel = this._translocoService.translate('generic.paginator.previous-page');
        this.paginator._intl.firstPageLabel = this._translocoService.translate('generic.paginator.first-page');
        this.paginator._intl.lastPageLabel = this._translocoService.translate('generic.paginator.last-page');
    }

    listenPage(event: any): void {
        this.onChangePage.emit(event);
        this.pageSignal.update((prev) => {
            return {
                ...prev,
                ...event
            }
        });
    }
}
