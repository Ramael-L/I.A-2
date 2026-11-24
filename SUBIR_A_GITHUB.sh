#!/usr/bin/env bash
set -euo pipefail
# Guardar este script dentro de la carpeta descomprimida I.A-2_Entrega.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/Downloads/I.A-2-repo"
REPO="https://github.com/Ramael-L/I.A-2.git"
for folder in CocinaClara RiwiMate entregables; do
  if [ ! -d "$ROOT/$folder" ]; then
    echo "Falta $ROOT/$folder. Descomprime la entrega completa primero."
    exit 1
  fi
done
if [ -e "$DEST" ] && [ ! -d "$DEST/.git" ]; then
  echo "$DEST ya existe y no es un repositorio Git. No se modificará."
  exit 1
fi
if [ ! -d "$DEST/.git" ]; then
  git clone "$REPO" "$DEST"
else
  git -C "$DEST" pull --ff-only origin main
fi
cp -a "$ROOT/CocinaClara" "$ROOT/RiwiMate" "$ROOT/entregables" "$DEST/"
cp "$ROOT/.gitignore" "$DEST/.gitignore"
cd "$DEST"
git add .gitignore CocinaClara RiwiMate entregables
if git diff --cached --quiet; then
  echo "No hay cambios por subir."
  exit 0
fi
git commit -m "Agrega Cocina Clara, RiwiMate y ZIP entregable de IA 2"
git push origin main
echo "Listo. Revisa $REPO"
