import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam
import joblib
import numpy as np


def calculate_evapotranspiration(df):
    # Constantes
    gamma = 0.065  # Constante psicrométrica (kPa/°C)
    rn_minus_g = 2.0  # Radiación neta menos flujo de calor (MJ/m²/día)
    u2 = 2.0  # Velocidad del viento (m/s)

    # Variables del dataset
    T = df['avg_air_temperature']  # Temperatura del aire (°C)
    RH = df['avg_air_humidity']  # Humedad relativa (%)

    # Cálculo de presión de vapor
    e_s = 0.6108 * np.exp((17.27 * T) / (T + 237.3))  # Saturación (kPa)
    e_a = e_s * (RH / 100)  # Presión real de vapor (kPa)

    # Pendiente de la curva de presión de vapor
    delta = (4098 * e_s) / ((T + 237.3) ** 2)  # (kPa/°C)

    # Cálculo simplificado de ET
    et = (0.408 * delta * rn_minus_g + gamma * (900 / (T + 273)) * u2 * (e_s - e_a)) / \
         (delta + gamma * (1 + 0.34 * u2))

    return et


def run_notebook(csv_path: str, model_output: str):
    print('Cargando datos desde', csv_path)

    # Cargar y preparar los datos
    df = pd.read_csv(csv_path)
    df['hour'] = pd.to_datetime(df['hour'], errors="coerce")
    df['evapotranspiration_rate'] = calculate_evapotranspiration(df)
    df = df.dropna()

    # Seleccionar variables relevantes
    X = df[['avg_air_temperature', 'avg_air_humidity', 'avg_soil_humidity']]
    y = df['evapotranspiration_rate']  # Variable objetivo: tasa de ET en mm/hora

    # Dividir los datos en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    # Crear el modelo de la red neuronal
    model = Sequential([
        Dense(64, input_dim=X_train.shape[1], activation='relu'),  # Capa oculta 1
        Dropout(0.2),  # Regularización para evitar sobreajuste
        Dense(32, activation='relu'),  # Capa oculta 2
        Dropout(0.2),
        Dense(1, activation='linear')  # Capa de salida (predicción continua)
    ])

    # Compilar el modelo
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])

    # Entrenar el modelo
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=50,
        batch_size=16,
        verbose=1
    )

    # Evaluar el modelo
    loss, mae = model.evaluate(X_test, y_test, verbose=0)
    print(f"Mean Absolute Error (MAE): {mae:.2f}")

    # Hacer predicciones
    y_pred = model.predict(X_test)

    # Comparar predicciones con los valores reales
    results = pd.DataFrame({
        'Actual': y_test.values,
        'Predicted': y_pred.flatten()
    })
    print(results.head())

    # Guardar el modelo
    joblib.dump(model, model_output)
    print(f"Modelo guardado en {model_output}")
