import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, importProvidersFrom, inject, Provider} from "@angular/core";
import {SocketService} from "./socket.service";
import {SocketIoModule} from "ngx-socket-io";
import {config} from "./socket.config";

export const provideSocket = (): Array<Provider | EnvironmentProviders> => {
    return [
        importProvidersFrom(SocketIoModule.forRoot(config)),
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(SocketService),
            multi: true,
        }
    ]
}
