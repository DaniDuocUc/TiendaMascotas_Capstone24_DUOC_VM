def run_notebook(csv_path: str, model_output: str):
    import pandas as pd
    from sklearn.model_selection import train_test_split
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    print('Cargando datos desde', csv_path)
    df = pd.read_csv(csv_path)
    df['hour'] = pd.to_datetime(df['hour'], errors="coerce")
    df = df.dropna()
    X = df[['avg_air_temperature', 'avg_air_humidity', 'avg_soil_humidity']]
    y = df['soil_humidity_difference']
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
        epochs=len(X_train),
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
        'Actual': y_test,
        'Predicted': y_pred.flatten()
    })
    print(results.head())
    import joblib
    joblib.dump(model, model_output)
