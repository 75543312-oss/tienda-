#!/usr/bin/env bash
# Importación masiva con mongoimport (MongoDB Database Tools).
# Uso:
#   bash database/02_importar.sh                         -> MongoDB local
#   MONGODB_URI="mongodb+srv://..." bash database/02_importar.sh  -> Atlas
# (La cadena de Atlas se pasa por variable de entorno, nunca se escribe aquí.)

URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/tienda_computadoras}"
DIR="$(dirname "$0")/data"

for c in proveedores productos clientes ventas; do
  mongoimport --uri "$URI" --collection "$c" --file "$DIR/$c.json" --jsonArray --drop
done
