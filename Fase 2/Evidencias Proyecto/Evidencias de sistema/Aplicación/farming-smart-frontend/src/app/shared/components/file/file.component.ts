import {Component, computed, effect, EventEmitter, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import * as XLSX from "xlsx";
import {Subject} from "rxjs";
import {FuseAlertComponent} from "../../../../@fuse/components/alert";
import {TranslocoModule} from "@ngneat/transloco";

@Component({
    selector: 'file',
    standalone: true,
    imports: [CommonModule, NgxFileDropModule, FuseAlertComponent, TranslocoModule],
    template: `
        <div>
            <span class="text-primary font-semibold dark:text-white">
                {{ title }}
            </span>
            <div class="flex gap-x-4 my-4">
                <ng-content select="[ngxButtons]"></ng-content>
                <div class="w-3/4 xl:w-1/2">
                    <ngx-file-drop
                        [dropZoneLabel]="(statusComputed() === 'upload') ? this.file?.name || fileUpload: dropZoneLabel"
                        [showBrowseBtn]="showBrowseBtn"
                        [browseBtnLabel]="browseBtnLabel"
                        (onFileDrop)="upload($event)"
                        [dropZoneClassName]="dropZoneClassName"
                        [contentClassName]="contentClassName"
                        [browseBtnClassName]="browseBtnClassName"
                    >
                        <button type="button">Browse Files</button>
                    </ngx-file-drop>
                </div>
            </div>
            <!-- Alerts -->
            <ng-container *ngIf="statusComputed() === 'error'">
                <ng-content select="[fileError]"></ng-content>
            </ng-container>

            <ng-container *ngIf="statusComputed() === 'upload'">
                <!--
                <ng-content select="[fileUpload]"></ng-content>
                -->
                <fuse-alert
                    appearance="border"
                    type="success"
                    showIcon="true"
                    class="mt-4 font-semibold max-w-1/2"
                >
               <span>
                     {{
                       processContent?.list?.length
                           | i18nPlural
                           : {
                               "=1":
                                   ('step-1.product-selected.tabs.exclude-file.file-drop.alerts.success.label-singular.part-1' | transloco) +
                                   processContent?.list?.length +
                                   ('step-1.product-selected.tabs.exclude-file.file-drop.alerts.success.label-singular.part-2' | transloco),
                               other:
                                   ('step-1.product-selected.tabs.exclude-file.file-drop.alerts.success.label-plural.part-1' | transloco) +
                                   processContent?.list?.length +
                                   ('step-1.product-selected.tabs.exclude-file.file-drop.alerts.success.label-plural.part-2' | transloco)
                           }
                   }}
               </span>
                </fuse-alert>
            </ng-container>
        </div>
    `,
    inputs: [
        {
            name: 'title',
            required: true
        },
        {
            name: 'fileUpload',
            required: true
        },
        {
            name: 'downloadMethod',
            required: true
        }, {
            name: 'dropZoneLabel',
            required: false
        }, {
            name: 'browseBtnLabel',
            required: false
        }, {
            name: 'showBrowseBtn',
            required: false
        }, {
            name: 'browseBtnClassName',
            required: false
        }, {
            name: 'dropZoneClassName',
            required: false
        }, {
            name: 'contentClassName',
            required: false
        }],
    outputs: [
        'handleError'
    ]
})
export class FileComponent {
    // ----------
    // @ Inputs
    public title: string = 'File';
    public fileUpload: string = '';
    public downloadMethod!: () => Promise<Blob>;
    public dropZoneLabel: string = 'Drop files here...';
    public browseBtnLabel: string = 'Browse Files';
    public showBrowseBtn: boolean = true;
    public browseBtnClassName: string = 'text-center underline underline-offset-1 w-full cursor-pointer';
    public dropZoneClassName: string = 'border-dashed border-2 border-gray-700 rounded-lg dark:border-gray-300';
    public contentClassName: string = 'text-gray-700 py-10 dark:text-gray-300';
    // ----------
    // @ Outputs
    public handleError: EventEmitter<string>;
    // ----------
    // @ Public
    public files: NgxFileDropEntry[] = [];
    public file: File | undefined;
    public status$ = new Subject<string>();
    // ----------
    // @ Status - Signal
    // ----------
    public status = signal('');
    public statusComputed = computed(() => {
        return this.status();
    });
    // ----------
    // @ Composition Class
    // ----------
    public processContent: ProcessContent<string>;

    constructor() {
        this.processContent = new ProcessContent();
        this.handleError = new EventEmitter<string>();
        effect(() => {
            this.status$.next(String(this.status()));
        }, {
            allowSignalWrites: true
        });
    }

    public cancel(params?: string): void {
        this.status.set((params) ? params : '');
        this.file = undefined;
        this.processContent.list.length = 0;
    }


    public async download(name: string): Promise<void> {
        try {
            const res = await this.downloadMethod()
            const url = window.URL.createObjectURL(res);
            const a = document.createElement('a');
            a.href = url;
            a.download = name ?? 'file.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (e) {
            this.handleError.emit('error-download');
        }

    }

    public async upload(files: NgxFileDropEntry[]): Promise<void> {
        this.files = files;
        for (const droppedFile of files) {
            // Is it a file?
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {
                    this.file = file;
                });
            } else {
                // It was a directory (empty directories are added, otherwise only files)
                const fileEntry =
                    droppedFile.fileEntry as FileSystemDirectoryEntry;
            }
        }

        if (!this.file) {
            return;
        }

        await this.processContent.process(this.file, {})
            .then((res) => {
                if (res === 'OK') {
                    this.status.set('upload');
                } else if (res === 'empty' || res === 'not file') {
                    this.status.set('error');
                }
            })
            .catch((err) => {
                this.status.set('error');
            });

    }
}

export class ProcessContent<T> {
    public list: T[];

    constructor() {
        this.list = [];
    }

    /**
     * Procesa el contenido del archivo
     * @param file
     * @param options
     */
    public process(file: File, options: any): Promise<string> {
        this.list = [];
        return new Promise(async (resolve, reject): Promise<void> => {
            try {
                if (!file) {
                    reject('not file');
                    return;
                }
                const contentBuffer = (await this._readFileAsync(
                    file
                )) as ArrayBuffer;
                const contentUintArray = new Uint8Array(contentBuffer);
                const workbook = XLSX.read(contentUintArray, {type: 'array'});
                const sheet = 'SKUS'
                const worksheet = workbook.Sheets[sheet];
                const data = XLSX.utils.sheet_to_json(worksheet, {
                    raw: true,
                    range: 3,
                    header: 'A'
                });
                if (data.length === 0) {
                    reject('empty');
                    return;
                }
                data.forEach((row: any) => {
                    const skuAux =
                        row['A'] ?? '';
                    this.list.push(skuAux);
                });
                if (this.list.length === 0) {
                    reject('empty');
                    return;
                }
                resolve('OK');
            } catch (e) {
                reject(e);
            }
        });
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
                // @ts-ignore
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}
