import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BasePredictionComponent} from "../base-prediction";

@Component({
  selector: 'automatic-prediction',
  standalone: true,
    imports: [CommonModule, BasePredictionComponent],
  templateUrl: './automatic-prediction.component.html',
  styles: [
  ]
})
export class AutomaticPredictionComponent {

}
