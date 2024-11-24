# Farming Smart Backend
---

## Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://farmingsmart@dev.azure.com/farmingsmart/Farming%20Smart/_git/farming-smart-backend
   ```

2. **Moverse al directorio del proyecto:**
   ```bash
   cd farming-smart-backend
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
     ```
   - Llena cada variable según las configuraciones específicas:
     - `DB_*`: Configuración de la base de datos PostgreSQL.

---


## Ejecución Local
### Versión requerida de python 3.11

1. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Levantar la aplicación:**
   ```bash
   cd backend
   py manage.py runserver
   ```
---

## Ejecución con Docker

1. **Construir la imagen Docker:**
   ```bash
   docker build -t farming-smart-backend .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run --env-file .env  -p <puerto-local>:<puerto-contenedor> farming-smart-backend
   docker run --env-file .env -p 8000:8000 farming-smart-backend
   ```
---
