import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LayoutV2Component} from "../layout/layout.component";
import {AutomaticPredictionComponent} from "./automatic-prediction";
import {ManualPredictionComponent} from "./manual-prediction";
import {MatTabsModule} from "@angular/material/tabs";
@Component({
    selector: 'analytics',
    standalone: true,
    imports: [
        CommonModule, LayoutV2Component, AutomaticPredictionComponent, ManualPredictionComponent, MatTabsModule
    ],
    templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {

    constructor() {

    }

}
