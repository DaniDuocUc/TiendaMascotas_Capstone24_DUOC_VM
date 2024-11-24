export interface IGetAlert {
    request_time: string;
    alert: IAlert;
}

export interface IAlert {
    alert_id: number;
    product_name: string;
    alert_name: string;
    condition: string;
    operator: string;
    threshold: string;
    time_window: string;
    metric: string;
    emails: string;
    custom_emails?: string[];
    status: string;
    last_triggered_at: null;
}


export interface IPostAlert {
    product_id: number;
    name: string;
    condition: string;
    operator: string;
    threshold: string;
    time_window: string;
    metric: string;
    emails: string;
    status: boolean;
}
