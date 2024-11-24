# Farming Smart Alerts Backend
---

## Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://farmingsmart@dev.azure.com/farmingsmart/Farming%20Smart/_git/farming-smart-backend-alerts
   ```

2. **Moverse al directorio del proyecto:**
   ```bash
   cd farming-smart-backend-alerts
   ```

3. **Crear el archivo `.env`:**
   - Usa el archivo `example.env` como referencia para definir las claves necesarias:
     ```plaintext
     # Database configuration
     DB_HOST=
     DB_NAME=
     DB_USER=
     DB_PASSWORD=
     DB_PORT=

     # Application URL
     APP_URL=

     # Email configuration
     ZOHO_USER=
     ZOHO_PASS=

     # Alert configuration
     ALERT_COOLDOWN_MINUTES=
     ALERT_PROCESS_INTERVAL_SECONDS=
     KEEP_AWAKE_INTERVAL_SECONDS=

     # Frontend URL
     URL_FRONTEND=

     # Application port
     PORT=
     ```
   - Llena cada variable según las configuraciones específicas:
     - `DB_*`: Configuración de la base de datos PostgreSQL.
     - `APP_URL`: URL base de la aplicación.
     - `ZOHO_*`: Configuración del correo (Zoho).
     - `ALERT_COOLDOWN_MINUTES`: Tiempo de espera antes de permitir que se gatille una alerta nuevamente (anti-spam).
     - `ALERT_PROCESS_INTERVAL_SECONDS`: Intervalo de tiempo para evaluar y gatillar alertas.
     - `KEEP_AWAKE_INTERVAL_SECONDS`: Intervalo de tiempo para que la aplicación se haga auto-request y se mantenga activa.
     - `URL_FRONTEND`: URL del frontend utilizada en el cuerpo del correo para redireccionar.
     - `PORT`: Puerto donde se ejecutará la aplicación.

---

## Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Levantar la aplicación:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en el puerto configurado en el archivo `.env` (por defecto: `PORT=3000`).

---

## Ejecución con Docker

1. **Construir la imagen Docker:**
   ```bash
   docker build -t farming-smart-backend-alerts .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run --env-file .env -p <puerto-local>:<puerto-contenedor> farming-smart-backend-alerts
   ```

   - Reemplaza `<puerto-local>` y `<puerto-contenedor>` con el puerto configurado en el archivo `.env` (por ejemplo, `3000:3000`).

   - El contenedor utilizará el archivo `.env` para configurar las variables de entorno necesarias.

---