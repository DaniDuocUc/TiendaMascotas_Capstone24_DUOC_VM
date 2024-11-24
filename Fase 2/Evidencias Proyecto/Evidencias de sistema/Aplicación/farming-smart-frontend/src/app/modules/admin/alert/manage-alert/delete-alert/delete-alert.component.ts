import {Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {DataService} from "../../../../../shared/services/data.service";
import {FuseConfirmationService} from "../../../../../../@fuse/services/confirmation";
import {SnackbarService} from "../../../../../shared/services/snackbar/snackbar.service";
import {ManageAlertService} from "../manage-alert.service";

@Component({
    selector: 'delete-alert',
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatIconModule],
    templateUrl: './delete-alert.component.html',
    styles: []
})
export class DeleteAlertComponent {
    @Input() id: number;
    private _dataService = inject(DataService);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _snackbarService = inject(SnackbarService);
    private _manageAlertService = inject(ManageAlertService);

    modal(): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Eliminar Alerta',
            message: '¿Estas seguro que deseas eliminar la alerta?',
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-circle',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Si,Eliminar',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'Cancelar',
                },
            },
            dismissible: false,
        });
        dialogRef.afterClosed().subscribe(async (result: string) => {
            if (result === 'cancelled' || !result) {
                return;
            }
            await this._delete(this.id);
            this._manageAlertService.status$.next('refresh');
        });
    }

    private _delete(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this._dataService.delete(`alert/${id}`).subscribe({
                next: (_) => {
                    this._snackbarService.show('Alerta eliminada correctamente', false);
                    resolve();
                },
                error: (_) => {
                    this._snackbarService.show('Ha ocurrido un error al eliminar la alerta');
                    reject();
                },
            });
        });
    }

}
