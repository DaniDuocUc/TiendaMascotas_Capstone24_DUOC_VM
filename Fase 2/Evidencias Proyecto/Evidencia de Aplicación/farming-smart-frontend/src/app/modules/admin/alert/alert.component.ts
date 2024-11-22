import {AfterViewInit, Component, inject, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutV2Component} from "../layout/layout.component";
import {MatTabGroup, MatTabsModule} from "@angular/material/tabs";
import {ManageAlertComponent, ManageAlertService} from "./manage-alert";
import {IColumn} from "../../../shared/components/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {AlertService} from "./alert.service";

@Component({
    selector: 'alert',
    standalone: true,
    imports: [CommonModule, LayoutV2Component, MatTabsModule, ManageAlertComponent, MatTooltipModule, MatButtonModule, MatIconModule],
    templateUrl: './alert.component.html',
    styles: []
})
export class AlertComponent implements AfterViewInit, OnDestroy {
    @ViewChild('tabGroup') tabGroup: MatTabGroup;
    columns: IColumn[] = [
        {
            property: 'alert_name',
            label: 'Nombre Alerta',
            type: 'string',
        },
        {
            property: 'product_name',
            label: 'Nombre Producto',
            type: 'string',
        },
        {
            property: 'condition',
            label: 'Condición',
            type: 'string',
        },
        {
            property: 'operator',
            label: 'Operador',
            type: 'string',
        },
        {
            property: 'threshold',
            label: 'Umbral',
            type: 'string',
        },
        {
            property: 'time_window',
            label: 'Ventana de Tiempo',
            type: 'string',
        },
        {
            property: 'status',
            label: 'Estado',
            type: 'custom',
        },
        {
            property: 'last_triggered_at',
            label: 'Última vez ejecutada',
            type: 'string',
        },
        {
            property: 'action',
            label: 'Opciones',
            type: 'action',
        }
    ];
    columnsForExecuted: IColumn[] = [
        {
            property: 'alert_name',
            label: 'Nombre Alerta',
            type: 'string',
        },
        {
            property: 'product_name',
            label: 'Nombre Producto',
            type: 'string',
        },
        {
            property: 'device_id',
            label: 'ID Dispositivo',
            type: 'string',
        },
        {
            property: 'condition',
            label: 'Condición',
            type: 'string',
        },
        {
            property: 'operator',
            label: 'Operador',
            type: 'string',
        },
        {
            property: 'threshold',
            label: 'Umbral',
            type: 'string',
        },
        {
            property: 'triggered_threshold_value',
            label: 'Valor Gatillante',
            type: 'string',
        },
        {
            property: 'time_window',
            label: 'Ventana de Tiempo',
            type: 'string',
        },
        {
            property: 'triggered_at',
            label: 'Ejecutada en',
            type: 'string',
        },
    ];
    private _manageAlertService = inject(ManageAlertService);
    private _alertService = inject(AlertService);

    ngAfterViewInit(): void {
        this.tabGroup.selectedIndex = this._alertService.indexTab;
    }

    ngOnDestroy(): void {
        this._alertService.indexTab = 0;
    }

    refresh(): void {
        this._manageAlertService.status$.next('refresh');
    }
}
