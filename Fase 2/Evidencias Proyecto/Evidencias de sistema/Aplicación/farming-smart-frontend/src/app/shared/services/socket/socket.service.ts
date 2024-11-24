import {inject, Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {environment} from "../../../../environments/environment";
import {SnackbarService} from "../snackbar/snackbar.service";
import {IDevice} from "../../../modules/admin/home";

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    isSocketConnected = false;
    message$: Subject<IDevice>;
    connected$: Subject<boolean>;
    private _socket: WebSocket;
    private _snackbarService = inject(SnackbarService);
    private shouldReconnect = true;

    constructor() {
        this.message$ = new Subject<IDevice>();
        this.connected$ = new Subject<boolean>();
    }

    connect(): void {
        console.log('Conectando a WebSocket...');
        this._socket = new WebSocket(environment.socket_url);

        this._socket.onopen = () => {
            console.log('Conexión WebSocket establecida.');
            this.onMessage();
            this.isSocketConnected = true;
            this.connected$.next(true);
            this._snackbarService.show('Conexión establecida para actualización en tiempo real', false);
            this._startKeepAlive();
        };

        this._socket.onclose = () => {
            this.isSocketConnected = false;
            console.warn('Conexión WebSocket cerrada.');
            this.connected$.next(false);
            if (this.shouldReconnect) {
                console.log('Intentando reconectar...');
                this.reconnect();
            } else {
                console.log('Desconexión intencionada, no se intentará reconectar.');
            }
        };

        this._socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            this._snackbarService.show('Error en la conexión WebSocket', true);
        };
    }

    onMessage(): void {
        this._socket.onmessage = (event: any) => {
            try {
                const parsedData = JSON.parse(event.data);
                this.message$.next(parsedData);
            } catch (error) {
                console.warn('Mensaje recibido no es JSON válido:', event.data);
            }
        };
    }

    disconnect(): void {
        this.shouldReconnect = false; // Indicar que no debe reconectar
        this.connected$.next(false);
        if (this._socket) {
            this._socket.close(); // Cerrar la conexión
        }
    }

    sendMessage(message: any): void {
        if (this._socket.readyState === WebSocket.OPEN) {  // Verificar si está abierta la conexión
            this._socket.send(JSON.stringify(message));
            if (message.command === 'startUpdates') {
                this._snackbarService.show('Actualización en tiempo real iniciada', false);
            } else {
                this._snackbarService.show('Actualización en tiempo real detenida', false);
            }
        } else {
            this._snackbarService.show('No se pudo enviar el mensaje. WebSocket no está conectado.', true);
        }
    }

    reconnect(attempts: number = 0): void {
        const maxAttempts = 3;
        const retryDelay = 10000;

        if (attempts < maxAttempts) {
            setTimeout(() => {
                console.log(`Intentando reconectar... intento ${attempts + 1}`);
                this.connect();  // Intenta reconectar
                this.reconnect(attempts + 1);  // Recursivamente intenta reconectar
            }, retryDelay);
        } else {
            console.error('Máximo de intentos de reconexión alcanzados.');
            this._snackbarService.show('No se pudo reconectar con el servidor WebSocket', true);
        }
    }

    private _startKeepAlive() {
        console.log('Iniciando keep-alive...');
        setInterval(() => {
            if (this._socket.readyState === WebSocket.OPEN) {
                this._socket.send(JSON.stringify({type: 'keep-alive'}));
                console.log('Keep-alive enviado');
            }
        }, 30000);
    }
}
