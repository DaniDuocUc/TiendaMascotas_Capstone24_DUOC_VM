from services.prediction import Prediction
from shared.time import set_time


def get_predictions(timeseries, avg_soil_humidity, model_01: Prediction, model_02: Prediction):
    predictions = []
    for i in range(0, len(timeseries)):
        avg_air_temp = float(timeseries[i]['data']['instant']['details']['air_temperature'])
        avg_air_hum = float(timeseries[i]['data']['instant']['details']['relative_humidity'])
        avg_soil_hum = float(avg_soil_humidity)
        soil_humidity_change = float(model_01.prediction(avg_air_temp, avg_air_hum, avg_soil_hum))
        avg_soil_humidity -= soil_humidity_change
        optimal_range = (40, 58)
        is_optimal = int(optimal_range[0] <= avg_soil_humidity <= optimal_range[1])
        prediction = {
            'avg_air_temperature': avg_air_temp,
            'avg_air_humidity': avg_air_hum,
            'soil_humidity_predicted': avg_soil_humidity,
            'is_optimal': is_optimal,
            "time": set_time(timeseries[i]['time'], -2)
        }
        predictions.append(prediction)

    return predictions
