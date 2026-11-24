#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_URL="https://github.com/Ramael-L/I.A-2.git"
DEST="$HOME/Downloads/I.A-2-repo"
for f in "$ROOT/CocinaClara/package.json" "$ROOT/entregables/pixel-perfect-match-main.zip" "$ROOT/entregables/CocinaClara_7_Personalizada_Recetas.zip"; do
  if [[ ! -f "$f" ]]; then echo "Falta el archivo $f: descomprime primero la entrega corregida"; exit 1; fi
done
if [[ -e "$DEST" && ! -d "$DEST/.git" ]]; then echo "$DEST existe y no es un repositorio. No se modificará."; exit 1; fi
if [[ -d "$DEST/.git" ]]; then
  git -C "$DEST" pull --ff-only origin main
else
  git clone "$REPO_URL" "$DEST"
fi
mkdir -p "$DEST/entregables"
rm -rf "$DEST/CocinaClara"
cp -a "$ROOT/CocinaClara" "$DEST/CocinaClara"
cp "$ROOT/entregables/pixel-perfect-match-main.zip" "$DEST/entregables/pixel-perfect-match-main.zip"
cp "$ROOT/entregables/CocinaClara_7_Personalizada_Recetas.zip" "$DEST/entregables/CocinaClara_7_Personalizada_Recetas.zip"
cp "$ROOT/README.md" "$ROOT/BITACORA.md" "$ROOT/.gitignore" "$DEST/"
cd "$DEST"
git add README.md BITACORA.md .gitignore CocinaClara entregables
if git diff --cached --quiet; then echo "Archivos sin cambios"; exit 0; fi
git commit -m "Entrega original Cocina Clara 7 y ZIP original RiwiMate"
git push origin main
echo "Verifica: $REPO_URL"
