from flask import Blueprint, jsonify

from db.data import get_data, get_location
from notebook.model_04 import run_notebook
from security.decorator import require_api_key
from services.model_04 import get_predictions
from services.prediction import Prediction
from services.weather import get_weather
from shared.model import get_model
from shared.routes import get_params, start_notebook

model_04 = Blueprint('model_04', __name__)


@model_04.route('/api/v1/model_04/predicts', methods=['GET'])
@require_api_key
def get():
    params = get_params()
    params['model_name'] = 'model_04'
    get_data(params['device_id'], params['start_date'], params['end_date'])
    output_model = start_notebook(params, run_notebook)
    model_01_joblib = get_model('ml/model_01_device_id_1.joblib')
    model_02_joblib = get_model(output_model)
    prediction_01 = Prediction(model_01_joblib, 'rnn')
    prediction_02 = Prediction(model_02_joblib, 'rnn')
    ## Get location
    location = get_location(params['device_id'])
    ## Get Weather
    timeseries = get_weather(location[0], location[1])
    if len(timeseries) == 0:
        return jsonify(
            {
                "status": "error",
                "message": "No se pudo obtener la información del clima"
            }
        ), 500

    ## Get Predictions
    predictions = get_predictions(timeseries, params['avg_soil_humidity'], prediction_01, prediction_02)
    response = {
        'predictions': predictions,
        "total_predictions": len(predictions),
        "device_id": params['device_id']
    }
    return jsonify(response)
