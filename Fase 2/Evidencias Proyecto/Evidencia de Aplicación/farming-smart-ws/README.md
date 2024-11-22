# Farming Smart WS

---

## Configuración Inicial

1. **Clonar el repositorio:**

   ```bash
   git clone https://farmingsmart@dev.azure.com/farmingsmart/Farming%20Smart/_git/farming-smart-ws
   ```

2. **Moverse al directorio del proyecto:**

   ```bash
   cd farming-smart-ws
   ```

3. **Crear el archivo `.env`:**

   - Usa el archivo `example.env` como referencia para definir las claves necesarias:

     ```plaintext
     # Database configuration
     PG_HOST=
     PG_USER=
     PG_PASSWORD=
     PG_DATABASE=
     PG_PORT=

     # API
     API_URL=

     # API Key for the IoT device
     API_KEY=
     ```

   - Llena cada variable según las configuraciones específicas:
     - `PG_*`: Configuración de la base de datos PostgreSQL.
     - `API_URL`: URL de la API a la que este servicio realizará solicitudes.
     - `API_KEY`: Clave API utilizada por este servicio para autenticar las solicitudes.

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

   La aplicación estará disponible en el puerto definido en la configuración.

---

## Ejecución con Docker

1. **Construir la imagen Docker:**

   ```bash
   docker build -t farming-smart-ws .
   ```

2. **Ejecutar el contenedor:**

   ```bash
   docker run --env-file .env -p <puerto-local>:<puerto-contenedor> farming-smart-ws
   ```

   - Reemplaza `<puerto-local>` y `<puerto-contenedor>` con el puerto en el que deseas exponer la aplicación.

   - El contenedor utilizará el archivo `.env` para configurar las variables de entorno necesarias.

---
