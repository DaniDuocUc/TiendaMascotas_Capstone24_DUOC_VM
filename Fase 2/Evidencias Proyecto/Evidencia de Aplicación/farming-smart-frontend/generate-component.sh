#!/bin/bash

# Verifica si se pasaron dos parámetros
if [ "$#" -ne 2 ]; then
    echo "Uso: $0 <ruta> <nombre-del-componente>"
    exit 1
fi

# Asigna los parámetros a variables
RUTA=$1
NAME=$2

# Crea la carpeta del componente en la ruta especificada
mkdir -p $RUTA/$NAME

# Cambia al directorio del componente
cd $RUTA/$NAME

# Genera el módulo y componente Angular
ng generate component $NAME --flat --standalone --skip-tests --inline-style
ng generate service $NAME --flat --skip-tests

# Crea los archivos index.ts y public-api.ts
touch index.ts
touch public-api.ts
touch $NAME.interface.ts

echo "Importando módulos y componentes..."

# Edita el archivo public-api.ts
{
    echo "export * from './$NAME.service';"
    echo "export * from './$NAME.component';"
    echo "// @ts-ignore";
    echo "export * from './$NAME.interface';"
} > public-api.ts

# Edita el archivo index.ts
echo "export * from './public-api';" > index.ts

echo "Componente '$NAME' creado en la ruta '$RUTA/$NAME'."
echo "Uso: $0 <ruta> <nombre-del-componente>"
