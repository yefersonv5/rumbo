#!/usr/bin/env bash
# Marca una versión nueva (fecha y hora) en todos los archivos y publica en GitHub.
# Uso: ./publicar.sh "mensaje del cambio"
set -euo pipefail
cd "$(dirname "$0")"
V=$(TZ=America/Bogota date +%Y%m%d%H%M%S)
printf '{"v": "%s"}\n' "$V" > version.json
sed -i -E "s/const BUILD = '[0-9]+';/const BUILD = '$V';/" app.js
sed -i -E "s/\?v=[0-9]+/?v=$V/g" index.html sw.js
sed -i -E "s/const CACHE = 'rumbo-[^']+';/const CACHE = 'rumbo-$V';/" sw.js
git add -A
MSG="${1:-Actualización}"
SUBJ="${MSG%%$'\n'*}"; REST="${MSG#"$SUBJ"}"
git commit -qm "$SUBJ (versión $V)$REST"
git push -q
echo "Publicada la versión $V"
