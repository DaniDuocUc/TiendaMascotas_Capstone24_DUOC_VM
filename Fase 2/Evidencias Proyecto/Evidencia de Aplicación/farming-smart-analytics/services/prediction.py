import numpy as np


class Prediction:
    def __init__(self, model, type: str):
        self.model = model
        self.type = type

    def prediction(self, avg_air_temp, avg_air_hum, avg_soil_hum):
        params = np.array([[avg_air_temp, avg_air_hum, avg_soil_hum]])
        if self.type == 'rfc':
            response = self.model.predict(params)[0]
        else:
            response = self.model.predict(params)[0][0]
        return response
