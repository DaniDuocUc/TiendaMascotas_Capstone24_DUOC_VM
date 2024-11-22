# Usar una imagen base de Python 3.11 (puedes ajustar según tus necesidades)
FROM python:3.11-slim

# Establecer variables de entorno para reducir las preguntas interactivas de APT
ENV DEBIAN_FRONTEND=noninteractive

# Instalar las dependencias del sistema necesarias (GDAL, PROJ, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    binutils \
    libproj-dev \
    gdal-bin \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Crear un nuevo usuario no root para evitar problemas de permisos
RUN useradd -m appuser

# Cambiar al usuario no root
USER appuser

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de requisitos y el código al contenedor
COPY requirements.txt /app/
COPY . /app/

# Crear un entorno virtual dentro del contenedor
RUN pip install --user virtualenv && \
    python -m venv /home/appuser/venv

# Activar el entorno virtual e instalar las dependencias del proyecto
ENV PATH="/home/appuser/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt


# Expone el puerto en el que correrá Django (generalmente 8000)
EXPOSE 8000

# moverse a la carpeta de la aplicación
WORKDIR /app/backend

# Instala las migraciones de Django
CMD ["python", "manage.py", "makemigrations"]

# Aplica las migraciones de Django
CMD ["python", "manage.py", "migrate"]

# Corre el servidor de desarrollo de Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
