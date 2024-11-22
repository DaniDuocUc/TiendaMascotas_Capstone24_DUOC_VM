import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {DataService} from "../../../../../shared/services/data.service";
import {IGetAlert, IPostAlert} from "../edit-alert";
import {FormAlertComponent} from "../form-alert";
import {SnackbarService} from "../../../../../shared/services/snackbar/snackbar.service";
import {ManageAlertService} from "../manage-alert.service";

@Component({
    selector: 'create-alert',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './create-alert.component.html',
    styles: []
})
export class CreateAlertComponent {
    private _matDialog = inject(MatDialog);
    private _dataService = inject(DataService);
    private _snackbarService = inject(SnackbarService);
    private _manageAlertService = inject(ManageAlertService);

    async open(): Promise<void> {
        const dialogRef = this._matDialog.open(FormAlertComponent, {
            data: {
                type: 'create',
                alert: null
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
                    await this._createAlert(result.data);
                    this._manageAlertService.status$.next('refresh');
                }
            }
        });
    }


    private _createAlert(alert: IPostAlert): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._dataService.post('/alert', alert).subscribe({
                next: (response: any) => {
                    this._snackbarService.show('Alerta creada correctamente', false);
                    resolve();
                },
                error: (error: any) => {
                    this._snackbarService.show('Error al crear la alerta');
                    reject();
                }
            });
        });
    }

}
