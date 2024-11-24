def create_query(device_id: str, start_date: str, end_date: str) -> str:
    return f"""
                SELECT
            DATE_TRUNC('hour', timestamp) AS hour,
            device_id,
            ROUND(CAST(AVG(air_temperature) AS NUMERIC), 3) AS avg_air_temperature,
            ROUND(CAST(AVG(air_humidity) AS NUMERIC), 3) AS avg_air_humidity,
            ROUND(LEAST(CAST(AVG(soil_humidity) AS NUMERIC), 100), 3) AS avg_soil_humidity,
            ROUND(LEAST(CAST(AVG(soil_humidity) AS NUMERIC), 100), 3)
            - LAG(ROUND(LEAST(CAST(AVG(soil_humidity) AS NUMERIC), 100), 3))
              OVER (PARTITION BY device_id ORDER BY DATE_TRUNC('hour', timestamp)) AS soil_humidity_difference,
            CASE
                WHEN ROUND(LEAST(CAST(AVG(soil_humidity) AS NUMERIC), 100), 3)
                     - LAG(ROUND(LEAST(CAST(AVG(soil_humidity) AS NUMERIC), 100), 3))
                       OVER (PARTITION BY device_id ORDER BY DATE_TRUNC('hour', timestamp)) > 10 THEN 1
                ELSE 0
            END AS irrigation_detected
        FROM farming_iot_logs
        WHERE
            timestamp BETWEEN '{start_date}' AND '{end_date}'
            AND soil_humidity IS NOT NULL
            AND device_id = '{device_id}'
        GROUP BY
            DATE_TRUNC('hour', timestamp), device_id
        ORDER BY
            device_id, hour;
        """
