# Farming Smart Reports
---

## Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://farmingsmart@dev.azure.com/farmingsmart/Farming%20Smart/_git/farming-smart-reports
   ```

2. **Moverse al directorio del proyecto:**
   ```bash
   cd farming-smart-reports
   ```

3. **Crear el archivo `.env`:**
   - Usa el archivo `example.env` como referencia para definir las claves necesarias:
     ```plaintext
     # API Key
     API_KEY=
     ```
   - Llena cada variable según las configuraciones específicas:
     - `API_KEY`: Clave API de la aplicación iot-backend.

---


## Ejecución Local
### Versión requerida de python 3.11

1. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Levantar la aplicación:**
   ```bash
   flask run
   ```
---

## Ejecución con Docker

1. **Construir la imagen Docker:**
   ```bash
   docker build -t farming-smart-reports .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run --env-file .env  -p <puerto-local>:<puerto-contenedor> farming-smart-reports
   docker run --env-file .env -p 5000:5000 farming-smart-reports
   ```
---
