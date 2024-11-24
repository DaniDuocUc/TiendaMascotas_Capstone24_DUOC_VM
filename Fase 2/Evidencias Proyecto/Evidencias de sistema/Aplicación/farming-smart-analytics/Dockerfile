# Usa una imagen base ligera
FROM python:3.11-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia solo el archivo de requerimientos para evitar reconstrucciones innecesarias de las capas
COPY requirements.txt .

# Instala dependencias del sistema necesarias para ciertas librerías
RUN apt-get update && apt-get install -y \
    libpq-dev gcc libatlas-base-dev python3-dev \
    && pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc libatlas-base-dev python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia el resto de los archivos del proyecto
COPY . .

# Da permisos al script de inicio
RUN chmod +x ./runserver.sh

# Expone el puerto de la aplicación
EXPOSE 5000

# Define el comando de inicio
ENTRYPOINT ["sh", "runserver.sh"]
