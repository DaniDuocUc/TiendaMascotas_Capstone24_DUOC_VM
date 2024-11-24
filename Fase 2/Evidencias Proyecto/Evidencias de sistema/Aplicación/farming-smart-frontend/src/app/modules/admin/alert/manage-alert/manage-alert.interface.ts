export interface IPaginatedAlert {
    page_size: number,
    request_time: string,
    current_page: number,
    total_pages: number,
    total_alerts: number,
    total_triggered_alerts: number,
    alerts: any[]
}
