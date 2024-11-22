import { Injectable} from "@angular/core";
import * as Highcharts from 'highcharts';

@Injectable({
    providedIn: 'root'
})
export class HighChartService {
    charts = [];
    defaultOptions = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
        },
        title: {
            text: 'Acción',
        },
        tooltip: {
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>',
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: 'black',
                    },
                },
                showInLegend: true,
            },
        },
        series: [
            {
                name: 'Brands',
                colorByPoint: true,
                data: [
                    {
                        name: 'Mantiene',
                        color: '#a2a9b3',
                        y: 2.6,
                    },
                    {
                        name: 'Sube',
                        color: '#89d0a3',
                        y: 91.4,
                    },
                    {
                        name: 'Baja',
                        color: '#91b0f4',
                        y: 6,
                    },
                ],
            },
        ],
    };
    constructor() {
    }
    createChart(container: any, loadOptions: boolean, options?: any): void {
        let opts = this.defaultOptions;
        const e = document.createElement('div');

        if (container) {
            container.appendChild(e);
        }
        if (loadOptions) {
            opts = {
                ...opts,
                ...options,
            };
        }
        // @ts-ignore
        Highcharts.chart(container, opts);
    }

}
