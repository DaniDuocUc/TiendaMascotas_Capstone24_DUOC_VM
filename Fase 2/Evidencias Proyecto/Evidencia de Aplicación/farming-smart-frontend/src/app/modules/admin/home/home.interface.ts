export interface IDevice {
    time_range: TimeRange;
    request_time: string;
    devices: Device[];
}

export interface Device {
    device_id: string;
    average_air_temperature: string;
    average_air_humidity: string;
    average_soil_humidity: string;
    area: Area;
    status: string;
    product_name: string;
    color?: string;
}

export interface Area {
    type: string;
    coordinates: Array<Array<number[]>>;
}

export interface TimeRange {
    start_time: Date;
    end_time: Date;
}

export interface ITimeList {
    label: string;
    value: number;
    type?: TTime;
}

export type TTime = 'seg' | 'min' | 'hr' | 'empty';



