# Farming Smart Frontend
---

## Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://farmingsmart@dev.azure.com/farmingsmart/Farming%20Smart/_git/farming-smart-frontend
   ```

2. **Moverse al directorio del proyecto:**
   ```bash
   cd farming-smart-frontend
   ```


## Ejecución Local
### Versión requerida de node v.16.14.0

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Levantar la aplicación:**
   ```bash
   ng serve --o
   ```

   La aplicación se abrirá por si sola en el navegador por defecto en el puerto 4200.

---

## Ejecución con Docker

1. **Construir la imagen Docker:**
   ```bash
   docker build -t farming-smart-frontend .
   ```

2. **Ejecutar el contenedor:**
   ```bash
   docker run  -p <puerto-local>:<puerto-contenedor> farming-smart-frontend
   docker run  -p 4200:4200 farming-smart-frontend
   ```
---

