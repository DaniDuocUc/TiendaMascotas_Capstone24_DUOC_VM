export interface IPrediction1 {
    device_id: string;
    predictions: Prediction[];
    total_predictions: number;
}

export interface Prediction {
    avg_air_humidity: number;
    avg_air_temperature: number;
    avg_soil_humidity: number;
    soil_humidity_change: number;
    soil_humidity_predicted: number;
    time: Date;
}
