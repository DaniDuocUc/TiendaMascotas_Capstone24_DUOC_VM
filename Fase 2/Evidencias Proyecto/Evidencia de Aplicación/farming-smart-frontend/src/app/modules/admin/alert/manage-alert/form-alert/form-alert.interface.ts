import {IAlert} from "../edit-alert";

export interface IFormAlert {
    type: 'create' | 'edit';
    alert?: IAlert;
}
