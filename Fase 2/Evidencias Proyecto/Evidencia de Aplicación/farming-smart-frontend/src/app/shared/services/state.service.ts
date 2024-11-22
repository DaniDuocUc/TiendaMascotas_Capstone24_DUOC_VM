import {Injectable, signal} from "@angular/core";
import {IStep01} from "../../modules/admin/optimize/pages/step-01/step-01.interface";

export type TScenarioStatus = 'BORRADOR' | 'OPTIMIZADO' | 'APROBADO';

@Injectable({
    providedIn: 'root'
})
export class StateService {
    scenarioCode = signal<string>(null);
    scenarioId = signal<number>(null);
    step01 = signal<IStep01>(null);
    execId = signal<string>(null);
    scenarioStatus = signal<string>('');

    clear(): void {
        this.scenarioCode.set(null);
        this.scenarioId.set(null);
        this.step01.set(null);
        this.execId.set(null);
        this.scenarioStatus.set('');
    }


    updateStep01(key: string, value: any): void {
        this.step01.set({
            ...this.step01(),
            [key]: value
        });
    }

    validateStatus(conditions: TScenarioStatus[], newStatus: TScenarioStatus): void {
        const status = this.scenarioStatus().toUpperCase() as TScenarioStatus;
        if (conditions.includes(status)) {
            this.scenarioStatus.set(newStatus);
        }
    }


    /**
     * Verify if exist execution id and scenarioStatus is not approved
     */
    verifyAction(): boolean {
        const scenarioStatus = this.scenarioStatus().toUpperCase() !== 'APROBADO';
        const execId = this.execId();
        return execId && scenarioStatus;
    }
}
