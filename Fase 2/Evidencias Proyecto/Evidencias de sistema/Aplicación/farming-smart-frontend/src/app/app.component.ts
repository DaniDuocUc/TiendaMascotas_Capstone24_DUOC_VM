import {AfterViewInit, Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SocketService} from "./shared/services/socket/socket.service";


@Component({
    imports: [RouterOutlet],
    selector: 'app-root',
    standalone: true,
    styleUrls: ['./app.component.scss'],
    templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
    private _socketService = inject(SocketService);

    /**
     * Constructor
     */
    constructor() {
        console.log('Version 1.1.0');
    }

    ngAfterViewInit(): void {
        this._socketService.connect();
    }
}
