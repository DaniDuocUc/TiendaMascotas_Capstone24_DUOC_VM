def get_params():
    from flask import request
    from datetime import date
    avg_soil_humidity = int(request.args.get('avg_soil_humidity')) if 'avg_soil_humidity' in request.args else 70
    device_id = request.args.get('device_id') if 'device_id' in request.args else '1'
    start_date = request.args.get('start_date') if 'start_date' in request.args else '2024-11-03'
    end_date = request.args.get('end_date') if 'end_date' in request.args else date.today().strftime("%Y-%m-%d")
    return {
        'avg_soil_humidity': avg_soil_humidity,
        'device_id': device_id,
        'start_date': start_date,
        'end_date': end_date
    }


def start_notebook(params, run_notebook):
    import os
    ## Run Neural Network
    device_id = params['device_id']
    start_date = params['start_date']
    end_date = params['end_date']
    model_name = params['model_name']
    csv_path = f"csv/device_id_{device_id}_{start_date}_{end_date}.csv"
    output_model = f"ml/{model_name}_device_id_{device_id}.joblib"
    if not os.path.exists(output_model):
        # Run Notebook
        run_notebook(csv_path, output_model)
    return output_model

