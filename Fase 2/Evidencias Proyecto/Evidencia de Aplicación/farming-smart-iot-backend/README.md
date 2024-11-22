# Farming Smart IoT Backend
---

## Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://farmingsmart@dev.azure.com/farmingsmart/Farming%20Smart/_git/farming-smart-iot-backend
   ```

2. **Moverse al directorio del proyecto:**
   ```bash
   cd farming-smart-iot-backend
   ```

3. **Crear el archivo `.env`:**
   - Usa el archivo `example.env` como referencia para definir las claves necesarias:
     ```plaintext
     # API Key for the IoT device
     API_KEY_DEVICE_1=

     # Database configuration
     DB_HOST=
     DB_NAME=
     DB_USER=
     DB_PASSWORD=
     DB_PORT=

     # Email configuration
     SMTP_USER=
     SMTP_PASSWORD=
     SMTP_HOST=
     SMTP_PORT=

     # Frontend URL
     URL_FRONTEND=

     # Application port
     PORT=

     # SSH configuration
     SSH_PASSWORD=
     ```
   - Llena cada variable según las configuraciones específicas:
     - `API_KEY_DEVICE_1`: Clave API de la aplicación.
     - `DB_*`: Configuración de la base de datos PostgreSQL.
     - `SMTP_*`: Configuración del correo (Zoho).
     - `URL_FRONTEND`: URL del frontend que utiliza la API.
     - `PORT`: Puerto donde se ejecutará la aplicación.
     - `SSH_PASSWORD`: Contraseña para acceder al contenedor por SSH si es necesario.

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
   docker build -t farming-smart-iot-backend .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run --env-file .env -p <puerto-local>:<puerto-contenedor> farming-smart-iot-backend
   ```

   - Reemplaza `<puerto-local>` y `<puerto-contenedor>` con el puerto configurado en el archivo `.env` (por ejemplo, `3000:3000`).

   - El contenedor utilizará el archivo `.env` para configurar las variables de entorno necesarias.

---

