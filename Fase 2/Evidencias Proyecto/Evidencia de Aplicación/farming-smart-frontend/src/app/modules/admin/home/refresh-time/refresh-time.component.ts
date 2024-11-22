import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {HomeService} from "../home.service";
import {subtractTime} from "../../../../shared/utils/date";

@Component({
    selector: 'refresh-time',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './refresh-time.component.html',
    styles: []
})
export class RefreshTimeComponent {
    homeService = inject(HomeService);

    refresh(): void {
        this.homeService.disableRefresh = true;
        if (this.homeService.lastUsed === 'manual-list') {
            const startTime = subtractTime(this.homeService.timeValue.value, this.homeService.timeValue.type);
            const endTime = new Date();
            this.homeService.createParams({startTime, endTime});
        }
        this.homeService.status$.next('refresh');
    }

}
