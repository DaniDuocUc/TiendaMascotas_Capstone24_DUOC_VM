import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    signal,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressBarModule, ProgressBarMode} from "@angular/material/progress-bar";
import {DataService} from "../data.service";
import {SnackbarService} from "../../../../shared/services/snackbar/snackbar.service";
import {HighChartService} from "../../../../shared/services/highchart.service";
import {IPrediction1} from "../analytics.interface";
import moment from "moment/moment";
import {Subject, takeUntil} from "rxjs";

const daysInSpanish = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const monthsInSpanish = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
    selector: 'base-prediction',
    standalone: true,
    imports: [CommonModule, MatProgressBarModule],
    templateUrl: './base-prediction.component.html',
    styles: []
})
export class BasePredictionComponent implements AfterViewInit, OnDestroy {
    @Input() deviceId: string = '1';
    @Input() soilHumidity: string = '70';
    @Input() type: 'automatic' | 'manual' = 'automatic';
    @ViewChild('chart01') chart01: ElementRef;
    @ViewChild('chart02') chart02: ElementRef;
    @ViewChild('chart03') chart03: ElementRef;
    hiddenChart: boolean = true;
    status$: Subject<string> = new Subject<string>();
    text: string = 'Recopilando datos del IoT N°1...';
    mode: ProgressBarMode = 'indeterminate';
    params: string = ''
    private _dataService = inject(DataService);
    private _snackbarService = inject(SnackbarService);
    private _highChartsService = inject(HighChartService);
    private _cdr = inject(ChangeDetectorRef);
    private _unsubscribeAll: Subject<void>;
    private _abortController: AbortController;

    constructor() {
        this._unsubscribeAll = new Subject();
        this._abortController = new AbortController();
    }

    async ngAfterViewInit(): Promise<void> {
        this.loadValues();
        if (this.type === 'automatic') {
            await this.predict();
        }

    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._abortController.abort();
    }

    loadValues(): void {
        this.text = `Recopilando datos del IoT N° ${this.deviceId}...`;
        this.params = `predicts?avg_soil_humidity=${this.soilHumidity}&device_id=${this.deviceId}&start_date=2024-11-03`;
    }

    async predict(): Promise<void> {
        try {
            this.hiddenChart = true;
            this.loadValues();
            this.status$.next('loading');
            await this.getPredictionModelOne();
            await this.getPredictionModelTwo();
            await this.getPredictionModelFour();
            await this.showMessages();
            this.status$.next('completed');
            this._snackbarService.show('Análisis avanzado completado', false);

        } catch (e) {
            this.status$.next('error');
            this.mode = 'determinate';
            this.text = 'Error al realizar la predicción';
        }
    }

    async showMessages(): Promise<void> {
        const messages = [
            'Recopilando datos del clima...',
            'Realizando la predicción del modelo RNN-001...',
            'Realizando la predicción del modelo RFC-002...',
            'Realizando la predicción del modelo RNN-004...',
            'Cargando gráficas...',
            'Predicción completa.'
        ];

        for (const message of messages) {
            this.text = message;
            await this.delay(800);
        }
        this.hiddenChart = false;
    }

    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    getPredictionModelOne(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._dataService.get<IPrediction1>('v1/model_01/' + this.params, {signal: this._abortController.signal})
                .pipe(
                    takeUntil(this._unsubscribeAll)
                )
                .subscribe({
                    next: (res) => {
                        this.loadChartOne(res).finally();
                        resolve();
                    },
                    error: (_) => {
                        this._snackbarService.show('Error al cargar los datos', true);
                        reject();
                    }
                })
        });
    }

    getPredictionModelTwo(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._dataService.get('v1/model_02/' + this.params, {signal: this._abortController.signal})
                .pipe(
                    takeUntil(this._unsubscribeAll)
                )
                .subscribe({
                    next: (res) => {
                        this.loadChartTwo(res).finally();
                        resolve();
                    },
                    error: (_) => {
                        this._snackbarService.show('Error al cargar los datos', true);
                        reject();
                    }
                })
        });
    }


    getPredictionModelFour(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._dataService.get('v1/model_04/' + this.params, {signal: this._abortController.signal})
                .pipe(
                    takeUntil(this._unsubscribeAll)
                )
                .subscribe({
                    next: (res) => {
                        this.loadChartFour(res).finally();
                        resolve();
                    },
                    error: (_) => {
                        this._snackbarService.show('Error al cargar los datos', true);
                        reject();
                    }
                })
        });
    }

    async loadChartOne(data: IPrediction1): Promise<void> {
        const predictions = data.predictions
            .slice(0, 36)
            .map(el => ({
                x: moment(el.time).valueOf(),
                y: el.avg_soil_humidity
            }));
        const todayDate = new Date();
        const today = todayDate.getTime() - todayDate.getTimezoneOffset() * 60 * 1000;
        this.updateChart(this.chart01, {
            chart: {
                type: 'line',
            },
            title: {
                text: 'Predicción de humedad del suelo en las siguientes horas',
                align: 'left'
            },
            subtitle: {
                text: 'Predicciones de la humedad del suelo para las próximas horas, considerando temperatura y humedad ambiental.',
                align: 'left'
            },
            xAxis: {
                type: 'datetime',
            },

            yAxis: {
                title: {
                    text: 'Humedad del suelo (%)'
                },
                plotBands: [
                    {
                        from: 91,
                        to: 100,
                        color: 'rgba(248,113,113,0.05)',
                        label: {
                            text: 'Humedad crítica',
                            style: {
                                color: '#606060'
                            }
                        }
                    },
                    {
                        from: 81,
                        to: 90,
                        color: 'rgba(250,204,21,0.05)',
                        label: {
                            text: 'Humedad anormal',
                            style: {
                                color: '#606060'
                            }
                        }
                    },
                    {
                        from: 60,
                        to: 80,
                        color: 'rgba(74,222,128,0.05)',
                        label: {
                            text: 'Humedad óptima',
                            style: {
                                color: '#606060'
                            }
                        }
                    },
                    {
                        from: 50,
                        to: 59,
                        color: 'rgba(250,204,21,0.05)',
                        label: {
                            text: 'Humedad anormal',
                            style: {
                                color: '#606060'
                            }
                        }
                    },
                    {
                        from: 0,
                        to: 49,
                        color: 'rgba(248,113,113,0.05)',
                        label: {
                            text: 'Humedad crítica',
                            style: {
                                color: '#606060'
                            }
                        }
                    },
                ]
            },

            legend: {
                enabled: false
            },

            tooltip: {
                formatter: function () {
                    const date = new Date(this.x);
                    const dayName = daysInSpanish[date.getUTCDay()];
                    const monthName = monthsInSpanish[date.getUTCMonth()];
                    const formattedDate = `${dayName},${date.getUTCDate()}${monthName},${date.getUTCHours()}:00`;
                    return `${formattedDate}<br / ><b>Humedad del suelo:</b> ${this.y.toFixed(2)}%`;
                },
                useHTML: true,
                valueSuffix: '%',
                valueDecimals: 2
            },

            series: [
                {
                    name: 'Humedad del suelo',
                    data: predictions,
                    zoneAxis: 'x',
                    lineWidth: 4,
                    marker: {
                        lineWidth: 2,
                        lineColor: '#4840d6',
                        fillColor: '#fff'
                    },
                    color: {
                        linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
                        stops: [
                            [0, '#fa4fed'],
                            [1, '#5897ff']
                        ]
                    },
                    zones: [{
                        value: today
                    }, {
                        dashStyle: 'Dot'
                    }]
                }
            ]

        })
    }

    async loadChartTwo(data: any): Promise<void> {
        const predictions = data.predictions
            .slice(0, 36)
            .map(el => ({
                x: moment(el.time).valueOf(),
                y: el.is_optimal,
                soilHumidity: el.soil_humidity_predicted
            }));
        const todayDate = new Date();
        const today = todayDate.getTime() - todayDate.getTimezoneOffset() * 60 * 1000;

        this.updateChart(this.chart02, {
            chart: {
                type: 'line',
            },
            title: {
                text: 'Predicción de la hora óptima para fertiirrigar en las siguientes horas',
                align: 'left'
            },
            subtitle: {
                text: 'Predicción basada en condiciones climáticas y humedad del suelo para optimizar la gestión del riego.',
                align: 'left'
            },
            xAxis: {
                type: 'datetime',
            },

            yAxis: [
                {
                    title: {
                        text: 'Hora óptima'
                    },
                    opposite: false // Eje izquierdo
                },
                {
                    title: {
                        text: 'Humedad del suelo (%)'
                    },
                    opposite: true // Eje derecho
                }
            ],

            legend: {
                enabled: false
            },

            tooltip: {
                formatter: function () {
                    const date = new Date(this.x);
                    const dayName = daysInSpanish[date.getUTCDay()];
                    const monthName = monthsInSpanish[date.getUTCMonth()];
                    const formattedDate = `${dayName},${date.getUTCDate()}${monthName},${date.getUTCHours()}:00`;
                    const isOptimal = this.y === 1 ? 'Sí' : 'No';
                    if (this.series.name === 'Hora Óptima') {
                        return `${formattedDate}<br / ><b>Hora óptima:</b> ${isOptimal}<br/ >`;
                    } else {
                        return `${formattedDate}<br / ><b>Humedad del Suelo:</b> ${this.y.toFixed(2)}%`;
                    }
                },
                useHTML: true,
            },

            series: [
                {
                    name: 'Hora Óptima',
                    data: predictions.map(el => ({
                        x: el.x,
                        y: el.y
                    })),
                    zoneAxis: 'x',
                    lineWidth: 4,
                    marker: {
                        lineWidth: 2,
                        lineColor: '#4840d6',
                        fillColor: '#fff'
                    },
                    color: {
                        linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
                        stops: [
                            [0, '#fa4fed'],
                            [1, '#5897ff']
                        ]
                    },
                    zones: [{
                        value: today
                    }, {
                        dashStyle: 'Dot'
                    }]
                },
                {
                    name: 'Humedad del Suelo',
                    data: predictions.map(el => ({
                        x: el.x,
                        y: el.soilHumidity
                    })),
                    yAxis: 1, // Asociar esta serie al eje derecho
                    lineWidth: 2,
                    color: '#28a745', // Color para la serie de humedad
                    dashStyle: 'ShortDash'
                }
            ]

        });
    }

    async loadChartFour(data: any): Promise<void> {
        const predictions = data.predictions
            .slice(0, 36)
            .map(el => ({
                x: moment(el.time).valueOf(),
                y: el.evapotranspiration_rate,
                soilHumidity: el.avg_soil_humidity,
                airTemperature: el.avg_air_temperature,
                airHumidity: el.avg_air_humidity
            }));
        const todayDate = new Date();
        const today = todayDate.getTime() - todayDate.getTimezoneOffset() * 60 * 1000;
        this.updateChart(this.chart03, {
            chart: {
                type: 'line',
            },
            title: {
                text: 'Predicción de la Evapotranspiración en las siguientes horas',
                align: 'left'
            },
            subtitle: {
                text: 'Predicción de la pérdida de agua en el suelo por evapotranspiración, considerando temperatura y humedad ambiental.',
                align: 'left'
            },
            xAxis: {
                type: 'datetime'
            },

            yAxis: [
                {
                    title: {
                        text: 'Evapotranspiración (mm)'
                    },
                    opposite: false // Eje izquierdo
                },
                {
                    title: {
                        text: 'Humedad del Suelo (%)'
                    },
                    opposite: true // Eje derecho
                },
                {
                    title: {
                        text: 'Temperatura del Aire (°C)'
                    },
                    opposite: true // Eje derecho
                },
                {
                    title: {
                        text: 'Humedad del Aire (%)'
                    },
                    opposite: true // Eje derecho
                }
            ],


            legend: {
                enabled: false
            },

            tooltip: {
                formatter: function () {
                    const date = new Date(this.x);
                    const dayName = daysInSpanish[date.getUTCDay()];
                    const monthName = monthsInSpanish[date.getUTCMonth()];
                    const formattedDate = `${dayName},${date.getUTCDate()}${monthName},${date.getUTCHours()}:00`;
                    if (this.series.name === 'Evapotranspiración') {
                        return `${formattedDate}<br/><b>Evapotranspiración:</b> ${this.y.toFixed(2)}mm`;
                    }
                    if (this.series.name === 'Humedad del Suelo') {
                        return `${formattedDate}<br/><b>Humedad del Suelo:</b> ${this.y.toFixed(2)}%`;
                    }
                    if (this.series.name === 'Temperatura del Aire') {
                        return `${formattedDate}<br/><b>Temperatura del Aire:</b> ${this.y.toFixed(2)}°C`;
                    }
                    if (this.series.name === 'Humedad del Aire') {
                        return `${formattedDate}<br/><b>Humedad del Aire:</b> ${this.y.toFixed(2)}%`;
                    }
                },
                useHTML: true,
                valueSuffix: 'mm',
                valueDecimals: 2
            },

            series: [
                {
                    name: 'Evapotranspiración',
                    data: predictions,
                    zoneAxis: 'x',
                    lineWidth: 4,
                    marker: {
                        lineWidth: 2,
                        lineColor: '#4840d6',
                        fillColor: '#fff'
                    },
                    color: {
                        linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
                        stops: [
                            [0, '#fa4fed'],
                            [1, '#5897ff']
                        ]
                    },
                    zones: [{
                        value: today
                    }, {
                        dashStyle: 'Dot'
                    }]
                },
                {
                    name: 'Humedad del Suelo',
                    data: predictions.map(el => ({
                        x: el.x,
                        y: el.soilHumidity
                    })),
                    lineWidth: 2,
                    color: '#28a745', // Color para la serie de humedad
                    dashStyle: 'ShortDash',
                    yAxis: 1 // Asociar esta serie al eje derecho
                },
                {
                    name: 'Temperatura del Aire',
                    data: predictions.map(el => ({
                        x: el.x,
                        y: el.airTemperature
                    })),
                    lineWidth: 2,
                    color: '#007bff', // Color para la serie de temperatura
                    dashStyle: 'ShortDash',
                    yAxis: 2 // Asociar esta serie al eje derecho
                },
                {
                    name: 'Humedad del Aire',
                    data: predictions.map(el => ({
                        x: el.x,
                        y: el.airHumidity
                    })),
                    lineWidth: 2,
                    color: '#ffc107', // Color para la serie de humedad
                    dashStyle: 'ShortDash',
                    yAxis: 3 // Asociar esta serie al eje derecho
                },

            ]

        })
    }

    updateChart(element: ElementRef, options: any): void {
        if (
            element === undefined
        ) {
            return;
        }
        options.responsive = {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                        minWidth: 500
                    },
                    chartOptions: {},
                },
            ],
        };
        this._cdr.detectChanges();
        this._highChartsService.createChart(element.nativeElement, true, options);
    }
}
