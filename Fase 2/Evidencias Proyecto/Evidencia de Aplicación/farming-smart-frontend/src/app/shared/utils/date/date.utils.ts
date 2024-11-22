import moment from "moment-timezone";
import {TTime} from "../../../modules/admin/home";

export class DateUtils {
    static convertFromGmtToUtc(date: Date): Date {
        const dateGTM = moment.tz(
            date,
            'GMT').format('YYYY-MM-DD');
        return moment(dateGTM).toDate();
    }
}


export const combineDateAndTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number); // Divide la cadena de la hora en horas y minutos
    const newDate = new Date(date); // Crea una nueva instancia de la fecha para no modificar el original
    newDate.setHours(hours, minutes, 0, 0); // Establece la hora y los minutos en la fecha
    return newDate;
}

export const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses empiezan en 0, por lo que sumamos 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export const subtractTime = (value: number, format: TTime): Date => {
    const currentDate = new Date();

    if (format === 'min') {
        currentDate.setMinutes(currentDate.getMinutes() - value);
    } else if (format === 'hr') {
        currentDate.setHours(currentDate.getHours() - value);
    } else if (format === 'seg') {
        currentDate.setSeconds(currentDate.getSeconds() - value);
    } else {
        throw new Error("Formato inválido. Utiliza 'min' o 'hr'.");
    }
    return currentDate;
};


export const convertToSeconds = (value: number, unit: string): number => {
    switch (unit) {
        case 'seg':
            return value;
        case 'min':
            return value * 60;
        case 'hr':
            return value * 3600;
        default:
            throw new Error('Unknown time unit');
    }
}
