import {Injectable, signal} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StepperService {
    public step = signal<number>(0);


    public checkStatus(status: string) {
        switch (status.toUpperCase()) {
            case 'APROBADO':
                this.step.set(6);
                break;
            case 'OPTIMIZADO':
                this.step.set(5);
                break;
            case 'BORRADOR':
                this.step.set(4);
                break;
            default:
                this.step.set(0);
                break;
        }

    }
}
