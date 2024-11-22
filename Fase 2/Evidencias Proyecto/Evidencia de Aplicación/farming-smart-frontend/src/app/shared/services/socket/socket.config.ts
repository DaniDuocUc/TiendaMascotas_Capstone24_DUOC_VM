import {environment} from "../../../../environments/environment";

export const config = {
    url: environment.socket_url,
    options: {
        transports: ['websocket'],
        reconnection: true
    }
};
