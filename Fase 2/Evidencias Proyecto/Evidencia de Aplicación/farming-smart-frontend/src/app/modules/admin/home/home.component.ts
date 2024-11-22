import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit, signal,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutV2Component} from "../layout/layout.component";
import * as L from 'leaflet';
import {MatDividerModule} from "@angular/material/divider";
import {HighChartService} from "../../../shared/services/highchart.service";
import {SocketService} from "../../../shared/services/socket/socket.service";
import {DataService} from "../../../shared/services/data.service";
import {IDevice} from "./home.interface";
import {SnackbarService} from "../../../shared/services/snackbar/snackbar.service";
import {FuseConfigService} from "../../../../@fuse/services/config";
import {Subject, takeUntil} from "rxjs";
import {MatIconModule} from "@angular/material/icon";
import {RefreshTimeComponent} from "./refresh-time";
import {ManualTimeComponent} from "./manual-time";
import {RealTimeComponent} from "./real-time";
import {HomeService} from "./home.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'home',
    standalone: true,
    imports: [CommonModule, LayoutV2Component, MatDividerModule, MatIconModule, RefreshTimeComponent, ManualTimeComponent, RealTimeComponent, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
    templateUrl: './home.component.html',
    styles: []
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart02') chart02: ElementRef;
    @ViewChild('chart03') chart03: ElementRef;
    @ViewChild('chart04') chart04: ElementRef;
    iots: IDevice;
    colorsTheme = {
        backgroundColor: '#fff',
        textColor: '#000',
    };
    locations: any[] = [];
    formControl: FormControl;
    status = signal<string>('');
    private _map: L.Map;
    private _unsubscribeAll: Subject<void>;
    private _highChartsService = inject(HighChartService);
    private _cdr = inject(ChangeDetectorRef);
    private _socketService = inject(SocketService);
    private _dataService = inject(DataService);
    private _snackbarService = inject(SnackbarService);
    private _fuseConfigService = inject(FuseConfigService);
    private _homeService = inject(HomeService);

    constructor() {
        this._unsubscribeAll = new Subject();
        this.formControl = new FormControl();
    }

    ngOnInit(): void {
        this.initMap();
    }

    async ngAfterViewInit(): Promise<void> {
        await this.getIOTs();
        setTimeout(() => {
            this.loadCharts();
            this.status.set('loaded');
        }, 800);
        this.connectToSocket();
        this._homeService.status$
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: async (status) => {
                    if (['refresh', 'manual'].includes(status)) {
                        this._map.remove();
                        this.initMap();
                        await this.getIOTs();
                        this.loadCharts();
                    }
                }
            })

        this._fuseConfigService.config$
            .pipe(
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(async (config) => {
                if (config.scheme === 'dark') {
                    this.colorsTheme.backgroundColor = '#334155';
                    this.colorsTheme.textColor = '#fff';
                } else {
                    this.colorsTheme.backgroundColor = '#fff';
                    this.colorsTheme.textColor = '#000';
                }
                this.loadCharts();
            });

        this.formControl.valueChanges.subscribe({
            next: (device) => {
                console.log(device);
                this._map.setView([device.lat, device.lng], 19);
            }
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    connectToSocket(): void {
        try {
            this._socketService.message$
                .pipe(
                    takeUntil(this._unsubscribeAll)
                )
                .subscribe((data) => {
                    if (data?.devices) {
                        this._map.remove();
                        this.initMap();
                        data.devices.sort((a, b) => Number(a.device_id) - Number(b.device_id));
                        this.loadIOTs(data);
                        this.loadCharts();
                    }

                });
        } catch (e) {
            console.error('Error en WebSocket:', e);
            this._snackbarService.show('Error en la conexión WebSocket', true);
        }

    }

    initMap(): void {
        this._map = L.map('map').setView([-32.8277454, -71.2231072], 18);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
        }).addTo(this._map);
    }

    getKpis(status: string): number {
        return this.iots?.devices?.filter((feature) => feature?.status === status).length || 0;
    }

    saveLocation(device: {
        id: string,
        lat: number,
        lng: number
    }): void {
        const index = this.locations.findIndex(item => item.id === device.id);
        if (index !== -1) {
            this.locations[index] = device;
        } else {
            this.locations.push(device);
        }
    }

    loadIOTs(data: IDevice): void {
        this.iots = data;
        if (this.iots.devices.length === 0) {
            return;
        }
        // @ts-ignore
        this.iots.devices = data.devices.map((iot) => {
            return {
                ...iot,
                average_air_temperature: Number(iot.average_air_temperature),
                average_air_humidity: Number(iot.average_air_humidity),
                average_soil_humidity: iot.average_soil_humidity !== 'NaN' ? Number(iot.average_soil_humidity) : 0,
                color: iot?.status === 'green' ? '#4ade80' : iot?.status === 'yellow' ? '#facc15' : '#f87171'
            };
        });
        this.iots.devices.forEach((iot) => {
            const coordinates = iot?.area?.coordinates[0];
            if (!coordinates) {
                return
            }
            if (['realtime-list', 'realtime-custom'].includes(this._homeService.lastUsed)) {
                const value = this.formControl.value;
                if (!value) {
                    this._map.setView([coordinates[0][1], coordinates[0][0]], 19);
                } else {
                    this._map.setView([value.lat, value.lng], 19);
                }
                this.saveLocation({
                    id: iot.device_id,
                    lat: coordinates[0][1],
                    lng: coordinates[0][0]
                })
            }

            const color = iot?.color;
            const product = iot?.product_name;
            const geo = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        coordinates
                    ]
                }
            };

            if (!['realtime-list', 'realtime-custom'].includes(this._homeService.lastUsed)) {
                this._map.setView([coordinates[0][1], coordinates[0][0]], 19);
                this.saveLocation({
                    id: iot.device_id,
                    lat: coordinates[0][1],
                    lng: coordinates[0][0]
                })
            }
            // @ts-ignore
            L.geoJSON(geo, {
                style: {
                    color: color,
                    fillOpacity: 0.3
                }
            })
                .addTo(this._map)

                .bindTooltip(`
                    <span> IOT N°${iot?.device_id} </span> <br>
                    <span> ${iot?.average_air_humidity}% de Humedad Ambiental </span> <br>
                     <span> ${iot?.average_soil_humidity ? iot?.average_soil_humidity : 0}% de Humedad Del Suelo </span> <br>
                    <span> ${iot?.average_air_temperature}°C de Temperatura Ambiental </span> <br>
                    <hr class="my-2">
                    <span>${product}</span>
                 `, {
                    permanent: false
                });

        });
    }

    getIOTs(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._dataService.get<IDevice>('device/averages' + this._homeService.params).subscribe({
                next: (data) => {
                    data.devices.sort((a, b) => Number(a.device_id) - Number(b.device_id));
                    this.loadIOTs(data);
                },
                error: (err: HttpErrorResponse) => {
                    if (err.status === 400) {
                        this._snackbarService.show('El rango de tiempo es desde un minuto a 24 horas');
                    }
                    if (err.status === 500) {
                        this._snackbarService.show('Ha ocurrido un error en el servidor');
                    }
                    this._homeService.disableRefresh = false;
                    reject();
                },
                complete: () => {
                    if (this.iots.devices.length === 0) {
                        this._snackbarService.show('No hay datos para mostrar');
                    } else {
                        this._snackbarService.show('Datos cargados correctamente', false);
                    }
                    this._homeService.disableRefresh = false;
                    resolve();
                }
            });
        });
    }

    loadCharts(): void {
        this.updateChart(this.chart02, {
            chart: {
                type: 'column',
                backgroundColor: this.colorsTheme.backgroundColor,
            },
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 500,
                        },
                        chartOptions: {},
                    },
                ],
            },
            title: {
                text: 'Humedad Del Suelo por Cuadrante IoT',
                style: {
                    color: this.colorsTheme.textColor,
                },
            },
            xAxis: {
                categories: this.iots.devices.map((iot) => `IoTs`),
                crosshair: true,
                labels: {
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },
            },
            yAxis:
                {
                    labels: {
                        format: '{value}%',
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    },
                    title: {
                        text: 'Humedad (%)',
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    },


                }
            ,
            legend: {
                itemStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHiddenStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHoverStyle: {
                    color: this.colorsTheme.textColor,
                },
            },
            tooltip: {
                backgroundColor: this.colorsTheme.backgroundColor,
                style: {
                    color: this.colorsTheme.textColor,
                },
                formatter: function () {
                    let header = `<small>${this.series.name}</small><br>`;
                    let body = `<strong>Humedad:</strong> ${this.y}%`;
                    return header + body;
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    }
                }

            },
            series: this.iots.devices.map((iot) => {
                return {
                    name: `IOT N°${iot.device_id}`,
                    data: [iot.average_soil_humidity],
                    color: iot.color,
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                };
            }),
        });
        this.updateChart(this.chart03, {
            chart: {
                type: 'column',
                backgroundColor: this.colorsTheme.backgroundColor,
            },
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 500,
                        },
                        chartOptions: {},
                    },
                ],
            },
            title: {
                text: 'Humedad Ambiental por Cuadrante IoT',
                style: {
                    color: this.colorsTheme.textColor,
                },
            },
            xAxis: {
                categories: this.iots.devices.map((iot) => `IoTs`),
                crosshair: true,
                labels: {
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },
            },
            yAxis:
                {
                    labels: {
                        format: '{value}%',
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    },
                    title: {
                        text: 'Humedad (%)',
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    },


                }
            ,
            legend: {
                itemStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHiddenStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHoverStyle: {
                    color: this.colorsTheme.textColor,
                },
            },
            tooltip: {
                backgroundColor: this.colorsTheme.backgroundColor,
                style: {
                    color: this.colorsTheme.textColor,
                },
                formatter: function () {
                    let header = `<small>${this.series.name}</small><br>`;
                    let body = `<strong>Humedad:</strong> ${this.y}%`;
                    return header + body;
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    }
                }

            },
            series: this.iots.devices.map((iot) => {
                return {
                    name: `IOT N°${iot.device_id}`,
                    data: [iot.average_air_humidity],
                    color: '#93c5fd',
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                };
            })
        });
        this.updateChart(this.chart04, {
            chart: {
                type: 'line',
                backgroundColor: this.colorsTheme.backgroundColor,
            },
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 500,
                        },
                        chartOptions: {},
                    },
                ],
            },
            title: {
                text: 'Temperatura Ambiental por Cuadrante IoT',
                style: {
                    color: this.colorsTheme.textColor,
                },
            },
            tooltip: {
                backgroundColor: this.colorsTheme.backgroundColor,
                style: {
                    color: this.colorsTheme.textColor,
                },
                formatter: function () {
                    let header = `<small>${this.x}</small><br>`;
                    let body = `<strong>Temperatura:</strong> ${this.y}°C`;
                    return header + body;
                }
            },
            plotOptions: {
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: [{
                        enabled: true,
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    }]
                }
            },
            yAxis: {
                labels: {
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },
                title: {
                    text: 'Temperatura (°C)',
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },

            },
            xAxis: {
                categories: this.iots.devices.map((iot) => `IOT N°${iot.device_id}`),
                crosshair: true,
                labels: {
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },
            },
            legend: {
                itemStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHiddenStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHoverStyle: {
                    color: this.colorsTheme.textColor,
                },
            },
            series: [{
                name: 'Temperatura',
                data: this.iots.devices.map((iot) => iot.average_air_temperature),
                color: '#93c5fd',
                style: {
                    color: this.colorsTheme.textColor,
                },
            }],
        });

        /*
        const colors = Highcharts.getOptions().colors.map(color =>
            Highcharts.color(color).setOpacity(0.5).get()
        );
        this.updateChart(this.chart04, {
            chart: {
                type: 'scatter',
                backgroundColor: this.colorsTheme.backgroundColor,
            },
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 500,
                        },
                        chartOptions: {},
                    },
                ],
            },
            title: {
                text: 'Dispersión de Humedad por Cuadrante IoT',
                style: {
                    color: this.colorsTheme.textColor,
                },
            },
            colors,
            xAxis: {
                categories: this.iots.devices.map((iot) => `IOT N°${iot.device_id}`),
                labels: {
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },
            },
            yAxis: {
                labels: {
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                },
                title: {
                    text: 'Humedad (%)',
                    style: {
                        color: this.colorsTheme.textColor,
                    },
                }
            },
            legend: {
                align: 'left',
                verticalAlign: 'top',
                itemStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHiddenStyle: {
                    color: this.colorsTheme.textColor,
                },
                itemHoverStyle: {
                    color: this.colorsTheme.textColor,
                },
            },
            plotOptions: {
                scatter: {
                    showInLegend: false,
                    jitter: {
                        x: 0.24,
                        y: 0
                    },
                    marker: {
                        radius: 2,
                        symbol: 'circle'
                    },
                    tooltip: {
                        pointFormat: 'Humedad: {point.y:.3f}',
                        backgroundColor: this.colorsTheme.backgroundColor,
                        style: {
                            color: this.colorsTheme.textColor,
                        },
                    }
                }
            },
            tooltip: {
                backgroundColor: this.colorsTheme.backgroundColor,
                style: {
                    color: this.colorsTheme.textColor,
                },
            },
            series: this.iots.devices.map((iot, index) => {
                return {
                    name: `IOT N°${iot.device_id}`,
                    data: this.getTestData(index)
                };
            }),
        });
         */
    }

    updateChart(element
                :
                ElementRef, options
                :
                any
    ):
        void {
        if (
            element === undefined
        ) {
            return;
        }
        this._cdr.detectChanges();
        this._highChartsService.createChart(element.nativeElement, true, options);
    }

}
