import {inject, Injectable} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslocoService} from "@ngneat/transloco";

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    private _snackbar = inject(MatSnackBar);
    private _translocoService = inject(TranslocoService);

    public show(text: string, error: boolean = true): void {
        this._snackbar.dismiss();
        const translate = this._translocoService.translate(text);
        const message = error ? `🔴 ${translate}` : `🟢 ${translate}`;
        this._snackbar.open(message, '');
    }

}
