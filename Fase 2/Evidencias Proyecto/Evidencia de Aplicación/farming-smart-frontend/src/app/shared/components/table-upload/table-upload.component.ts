import {Component, ViewChild} from "@angular/core";
import {MatIconModule} from "@angular/material/icon";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {NgClass} from "@angular/common";
import {TranslocoModule} from "@ngneat/transloco";
import {read, utils} from "xlsx";

@Component({
    selector: 'table-upload',
    standalone: true,
    template: `
        <button #button [disabled]="button.disabled" mat-stroked-button color="primary"
                [class]="'disabled:cursor-not-allowed flex items-center gap-x-2 '+class"
                [ngClass]="{
                    'mat-button-disabled ': button.disabled
                }"
        >
            <label
                for="files-upload"
                class="custom-file-upload  dark:text-white"
            >

                {{
                    label
                }}
            </label>
            <mat-icon
                color="primary"
                class="dark:!text-white"
            >file_upload
            </mat-icon
            >

            <input
                id="files-upload"
                type="file"
                (change)="upload($event)"
                [disabled]="button.disabled"
            />
        </button>
    `,
    styles: [
        `
            input[type="file"] {
                display: none;
            }

            .custom-file-upload {
                display: inline-block;
            }
        `
    ],
    imports: [MatIconModule, MatButtonModule, NgClass, TranslocoModule],
    inputs: [
        {
            name: 'callback',
            required: true
        },
        {
            name: 'label',
            required: true
        },
        {
            name: 'class',
            required: false
        },
        {
            name: 'tab',
            required: true
        }, {
            name: 'key',
            required: true
        }
    ]
})
export class TableUploadComponent {
    //-----------------
    // @ Inputs
    public label!: string;
    public class!: string;
    public tab!: string;
    public callback: (array: any[], callback: (item: any) => void) => void;
    public key: string;
    //-----------------
    // @ View child
    @ViewChild('button') button!: MatButton;
    //-----------------
    // @ Public
    data: any[] = [];

    constructor() {
    }

    public async upload(event: any): Promise<void> {
        try {
            const file = (event.target as HTMLInputElement).files[0];
            /*
            if (file.name != this._currentFilename) {
                throw new Error('Archivo excel equivocado');
            }
             */
            this.button.disabled = true;
            await this._processExcelContent(file);
            this.button.disabled = false;
            event.target.value = '';
        } catch (err) {
            // alert to show error
        }
    }

    public validateTypeFile(file: File): boolean {
        return file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    public findColumnIndex(value: any, key: string): number {
        return value.findIndex((element) => element === key);
    }

    private _createHeader(currentCost: number, scenarioSku: number = 13, arrayLength: number = 15): string[] {
        // Definir los índices de las columnas que tienen nombres específicos
        const namedColumns = {
            [currentCost]: 'costo_vigente',
            [scenarioSku]: 'scenario_sku_id'
        };
        // Crear el arreglo de cabeceras, llenando la mayoría con null y asignando nombres específicos donde sea necesario
        return Array.from({length: arrayLength}, (_, i) => namedColumns[i] || null);
    }


    private async _processExcelContent(file: File) {
        try {
            // Validate file type
            if (!this.validateTypeFile(file)) {
                return;
            }

            // Read file content
            const contentBuffer = (await this._readFileAsync(
                file
            )) as ArrayBuffer;
            const contentUintArray = new Uint8Array(contentBuffer);
            const workbook = read(contentUintArray, {type: 'array'});
            const ws = workbook.Sheets[this.tab];
            const header = this._createHeader(3, 13);
            const newArray = utils.sheet_to_json(ws, {
                header: header,
                blankrows: false
            }) as any[];
            //newArray.sort((a, b) => a.scenario_sku_id - b.scenario_sku_id);
            if (this.callback) {
                this.callback(newArray, this._updateData);
            }
            // alert to show success
        } catch (err) {
            // alert to show error
        }
    }

    public updateData(item: any): void {
        this._updateData(item);
    }


    private _updateData = (item: any): void => {
        const index = this.data.findIndex((element) => element[this.key] === item[this.key]);
        if (index !== -1) {
            this.data[index] = item;
            return;
        }
        this.data.push(item);
    }


    /**
     * Devuelve el contenido del archivo luego del evento onload
     *
     * @param file
     * @returns Promise
     */
    private _readFileAsync(file: File): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}
