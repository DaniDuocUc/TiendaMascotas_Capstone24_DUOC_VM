from flask import Blueprint, jsonify

from db.data import get_data, get_location
from notebook.model_01 import run_notebook
from security.decorator import require_api_key
from services.model_01 import get_predictions
from services.prediction import Prediction
from services.weather import get_weather
from shared.model import get_model
from shared.routes import get_params, start_notebook

model_01 = Blueprint('model_01', __name__)


@model_01.route('/api/v1/model_01/predicts', methods=['GET'])
@require_api_key
def get():
    params = get_params()
    params['model_name'] = 'model_01'
    get_data(params['device_id'], params['start_date'], params['end_date'])
    output_model = start_notebook(params, run_notebook)
    model = get_model(output_model)
    prediction = Prediction(model, 'rnn')
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
    predictions = get_predictions(timeseries, params['avg_soil_humidity'], prediction)
    response = {
        'predictions': predictions,
        "total_predictions": len(predictions),
        "device_id": params['device_id']
    }
    return jsonify(response)
