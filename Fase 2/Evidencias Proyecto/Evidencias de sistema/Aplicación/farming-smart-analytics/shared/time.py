def set_time(time, hours: int) -> str:
    from datetime import datetime, timedelta
    # Ajustar el tiempo
    original_time = datetime.fromisoformat(time)  # Convertir a objeto datetime
    corrected_time = original_time + timedelta(hours=hours)  # Ajustar 3 horas
    corrected_time_iso = corrected_time.isoformat()  # Convertir de vuelta a ISO format
    return corrected_time_iso
