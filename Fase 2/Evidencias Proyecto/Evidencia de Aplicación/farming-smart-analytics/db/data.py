import os
import pandas as pd
from sqlalchemy import text

from db.connection import engine
from db.query import create_query




def get_data(device_id: str, start_date: str, end_date: str) -> pd.DataFrame:
    path = f"csv/device_id_{device_id}_{start_date}_{end_date}.csv"
    if os.path.exists(path):
        print(f"El archivo {path} ya existe. No se ejecutará la consulta.")
        return pd.read_csv(path)
    query = create_query(device_id, start_date, end_date)
    df = pd.read_sql(query, engine)
    df.to_csv(path, index=False)
    print(f"Consulta ejecutada y resultados guardados en {path}.")
    return df


def get_location(device_id: str):
    try:
        # Conectar al engine y ejecutar la consulta
        with engine.connect() as connection:
            query = text("""
                    SELECT 
                        ST_X(location) AS longitude,
                        ST_Y(location) AS latitude
                    FROM 
                        farming_iot
                    WHERE 
                        id = :device_id;
                """)

            # Ejecutar la consulta con parámetros
            result = connection.execute(query, {"device_id": device_id}).fetchone()

            # Verificar si se encontró un resultado
            if result:
                return [result.latitude, result.longitude]  # Devolver latitud y longitud
            else:
                return None  # No se encontró el dispositivo

    except Exception as e:
        print(f"Error: {e}")
        return None
