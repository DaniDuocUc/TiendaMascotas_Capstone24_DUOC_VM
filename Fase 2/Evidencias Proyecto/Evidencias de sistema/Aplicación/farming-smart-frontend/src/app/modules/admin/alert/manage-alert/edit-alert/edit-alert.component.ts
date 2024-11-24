import {Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {FormAlertComponent} from "../form-alert";
import {DataService} from "../../../../../shared/services/data.service";
import {IAlert, IGetAlert, IPostAlert} from "./edit-alert.interface";
import {SnackbarService} from "../../../../../shared/services/snackbar/snackbar.service";
import {ManageAlertService} from "../manage-alert.service";

@Component({
    selector: 'edit-alert',
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatIconModule],
    templateUrl: './edit-alert.component.html',
    styles: []
})
export class EditAlertComponent {
    @Input() id: number;
    alert: IAlert;
    private _matDialog = inject(MatDialog);
    private _dataService = inject(DataService);
    private _snackbarService = inject(SnackbarService);
    private _manageAlertService = inject(ManageAlertService);

    getAlert(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._dataService.get(`/alert/${this.id}`).subscribe({
                next: (response: IGetAlert) => {
                    this.alert = response.alert;
                    this.alert.custom_emails = this.alert.emails.split(',');
                    resolve();
                },
                error: (_) => {
                    reject();
                }
            })
        });
    }

    async open(): Promise<void> {
        await this.getAlert();
        const dialogRef = this._matDialog.open(FormAlertComponent, {
            data: {
                type: 'edit',
                alert: this.alert
            },
            width: '800px',
            minHeight: '100vh',
            position: {
                top: '0',
                right: '0'
            },
            panelClass: 'custom-alert-dialog'
        });
        dialogRef.afterClosed().subscribe({
            next: async (result: {
                status: string;
                data: IPostAlert;
            }) => {
                if (result.status === 'save') {
                    await this._updateAlert(result.data);
                    this._manageAlertService.status$.next('refresh');
                }
            }
        });
    }


    private _updateAlert(alert: IPostAlert): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._dataService.put(`alert/${this.id}`, alert).subscribe({
                next: (_) => {
                    this._snackbarService.show('Alerta actualizada correctamente', false);
                    resolve();
                },
                error: (_) => {
                    this._snackbarService.show('Error al actualizar la alerta');
                    reject();
                }
            });
        });
    }

}
