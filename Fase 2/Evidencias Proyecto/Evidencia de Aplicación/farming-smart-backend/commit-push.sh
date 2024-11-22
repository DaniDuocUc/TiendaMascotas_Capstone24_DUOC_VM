#!/bin/bash

# Verifica si se pasó un parámetro
if [ "$#" -ne 1 ]; then
    echo "Uso: $0 <mensaje-del-commit>"
    exit 1
fi

# Asigna el parámetro a una variable
COMMIT_MSG=$1

# Obtiene el nombre de la rama actual
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# Verifica si hay una rama actual
if [ -z "$BRANCH_NAME" ]; then
    echo "No se pudo determinar la rama actual."
    exit 1
fi

echo "Rama actual: $BRANCH_NAME"

# Añade todos los cambios al staging
git add .

# Realiza el commit con el mensaje proporcionado
git commit -m "$COMMIT_MSG"

# Pushea a la rama actual
git push origin "$BRANCH_NAME"
