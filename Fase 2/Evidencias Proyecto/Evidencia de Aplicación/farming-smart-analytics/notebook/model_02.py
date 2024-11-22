def run_notebook_rfc(csv_path: str, model_output: str):
    from sklearn.metrics import mean_absolute_error
    import joblib
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import classification_report, confusion_matrix, f1_score, recall_score, precision_score
    from sklearn.preprocessing import MinMaxScaler

    # Cargar las neuronas del gonza
    rn_1 = joblib.load('ml/model_01_device_id_1.joblib')
    # Cargar los datos del CSV
    df = pd.read_csv(csv_path)
    df['hour'] = pd.to_datetime(df['hour'])  # Asegúrate de manejar la columna 'hour'

    # Calcular la columna 'result' en base a la predicción de humedad
    def predict_soil_moisture(row):
        air_temperature = row['avg_air_temperature']
        air_humidity = row['avg_air_humidity']
        soil_humidity = row['avg_soil_humidity']

        new_data = np.array([[air_temperature, air_humidity, soil_humidity]])
        predicted_change = rn_1.predict(new_data)[0][0]
        return round(soil_humidity + predicted_change, 2)

    # Aplicar la predicción de la humedad proyectada para cada fila
    df['soil_humidity_predicted'] = df.apply(predict_soil_moisture, axis=1)

    # Definir los límites del rango óptimo
    optimal_range = (40, 58)  # (mínimo, máximo)

    # Crear la variable objetivo 'is_optimal' (0 = No es óptimo, 1 = Es óptimo)
    df['is_optimal'] = df['soil_humidity_predicted'].between(optimal_range[0], optimal_range[1]).astype(int)

    # Seleccionar las variables predictoras y la variable objetivo
    X = df[['avg_air_temperature', 'avg_air_humidity', 'soil_humidity_predicted']].values
    y = df['is_optimal'].values

    # Dividir en conjuntos de entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    # Escalar los datos
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Crear el modelo de Random Forest
    clf = RandomForestClassifier(n_estimators=150, random_state=42)
    clf.fit(X_train_scaled, y_train)

    # Evaluar el modelo
    y_pred = clf.predict(X_test_scaled)
    print(classification_report(y_test, y_pred))

    # Calcular las métricas F1, Recall y Precision
    f1 = f1_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)

    print(f"\nF1 Score: {f1:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"Precision: {precision:.4f}")

    # Calcular el MAE
    mae = mean_absolute_error(y_test, clf.predict(X_test))
    print(f"Mean Absolute Error (MAE): {mae:.2f}")
    import joblib
    joblib.dump(clf, model_output)


def run_notebook_rnn(csv_path: str, model_output: str):
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    import joblib
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    rn_1 = joblib.load('ml/model_01_device_id_1.joblib')
    df = pd.read_csv(csv_path)
    df['hour'] = pd.to_datetime(df['hour'])

    def predict_soil_moisture(row):
        air_temperature = row['avg_air_temperature']
        air_humidity = row['avg_air_humidity']
        soil_humidity = row['avg_soil_humidity']
        new_data = np.array([[air_temperature, air_humidity, soil_humidity]])
        predicted_change = rn_1.predict(new_data)[0][0]
        return round(soil_humidity + predicted_change, 2)

    df['soil_humidity_predicted'] = df.apply(predict_soil_moisture, axis=1)

    optimal_range_min = 40  # Ajusta según las necesidades
    optimal_range_max = 58  # Ajusta según las necesidades
    df['is_optimal'] = ((df['soil_humidity_predicted'] >= optimal_range_min) & (
            df['soil_humidity_predicted'] <= optimal_range_max)).astype(int)
    X = df[['avg_air_temperature', 'avg_air_humidity', 'soil_humidity_predicted']].values
    y = df['is_optimal'].values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    model = Sequential([
        Dense(64, input_dim=X_train.shape[1], activation='relu'),  # Capa oculta 1
        Dropout(0.2),  # Regularización para evitar sobreajuste
        Dense(32, activation='relu'),  # Capa oculta 2
        Dropout(0.2),
        Dense(1, activation='linear')  # Capa de salida (predicción continua)
    ])

    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])

    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=50,
        batch_size=16,
        verbose=1
    )

    loss, mae = model.evaluate(X_test, y_test, verbose=0)
    print(f"Mean Absolute Error (MAE): {mae:.2f}")
    import joblib
    joblib.dump(model, model_output)
