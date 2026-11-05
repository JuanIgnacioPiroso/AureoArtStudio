#!/usr/bin/env bash
# Regenera los woff2 recortados de src/assets/fonts/ a partir de los TTF de origen.
#
#   scripts/subset-fonts.sh <carpeta-de-origen> [<otra-carpeta>…]
#
# Busca cada TTF por nombre (también en subcarpetas) en las carpetas que se le pasan:
# brand/tipografia/ para Bodoni Moda y Hanken Grotesk, y una copia de las carpetas
# ofl/<familia>/ de github.com/google/fonts para las 17 de grabado del Lab.
# La licencia se toma de OFL.txt u OFL-<Familia>.txt, al lado del TTF.
#
# Necesita fonttools y brotli (pip install fonttools brotli). PYTHON elige el intérprete.
# No se corre en el build: los woff2 se versionan.
set -euo pipefail

PYTHON="${PYTHON:-python3}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/src/assets/fonts"

if [ "$#" -eq 0 ]; then
  echo "Uso: $0 <carpeta-de-origen> [<otra-carpeta>…]" >&2
  exit 1
fi
"$PYTHON" -c 'import fontTools, brotli' 2>/dev/null || {
  echo "Falta fonttools o brotli: $PYTHON -m pip install fonttools brotli" >&2
  exit 1
}

# Sitio: latín básico + español, más los caracteres que usan los textos de src/ (p. ej. ©, Ø, →).
SITE_BASE='U+0020-007E,U+00A1,U+00BF,U+00AB,U+00BB,U+00C1,U+00C9,U+00CD,U+00D3,U+00DA,U+00DC,U+00D1,U+00E1,U+00E9,U+00ED,U+00F3,U+00FA,U+00FC,U+00F1,U+2018,U+2019,U+201C,U+201D,U+2013,U+2014,U+2026,U+00B7,U+2022,U+20AC,U+00B0,U+00D7,U+00AA,U+00BA'
SITE_EXTRA="$("$PYTHON" - "$ROOT/src" <<'EOF'
import pathlib, sys
chars = set()
for f in pathlib.Path(sys.argv[1]).rglob('*'):
    if f.is_file() and '__tests__' not in f.parts and f.suffix in {'.ts', '.tsx', '.astro', '.md', '.mdx', '.json', '.css'}:
        chars.update(ch for ch in f.read_text(encoding='utf-8') if ord(ch) > 0x7E)
print(','.join(f'U+{ord(ch):04X}' for ch in sorted(chars)))
EOF
)"
SITE_UNICODES="$SITE_BASE${SITE_EXTRA:+,$SITE_EXTRA}"

# Grabado: Latin-1 + Latin Extended-A, más comillas, rayas, puntos suspensivos, viñeta y euro.
LAB_UNICODES='U+0000-00FF,U+0100-017F,U+2018,U+2019,U+201C,U+201D,U+2013,U+2014,U+2026,U+2022,U+20AC'

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

find_source() {
  # Los corchetes de los nombres variables («[wght]») se escapan para que -name no los lea como glob.
  local pattern dir found
  pattern="$(printf '%s' "$1" | sed 's/[][*?]/\\&/g')"
  shift
  for dir in "$@"; do
    found="$(find "$dir" -type f -name "$pattern" -print -quit 2>/dev/null || true)"
    if [ -n "$found" ]; then
      echo "$found"
      return
    fi
  done
}

# salida | TTF de origen | ejes para varLib.instancer («-»: se deja como está) | recorte
# Bodoni y Hanken conservan los ejes completos: recortarlos redondea los contornos de los pesos
# intermedios. El rango que se usa (400–700 y 400–600) lo declara astro.config.mjs.
while IFS='|' read -r slug source axes set; do
  [ -z "$slug" ] && continue
  ttf="$(find_source "$source" "$@")"
  if [ -z "$ttf" ]; then
    echo "No encontré $source en: $*" >&2
    exit 1
  fi

  input="$ttf"
  if [ "$axes" != "-" ]; then
    input="$TMP/$slug.ttf"
    # shellcheck disable=SC2086 # los ejes van como argumentos separados
    "$PYTHON" -m fontTools.varLib.instancer "$ttf" $axes -o "$input" -q
  fi

  if [ "$set" = "site" ]; then unicodes="$SITE_UNICODES"; else unicodes="$LAB_UNICODES"; fi
  "$PYTHON" -m fontTools.subset "$input" \
    --unicodes="$unicodes" \
    --layout-features='*' \
    --drop-tables+=FFTM \
    --flavor=woff2 \
    --output-file="$OUT/$slug.woff2"

  license="$(dirname "$ttf")/OFL.txt"
  [ -f "$license" ] || license="$(dirname "$ttf")/OFL-$(basename "$ttf" | sed -E 's/[-[].*//').txt"
  if [ ! -f "$license" ]; then
    echo "No encontré la licencia OFL de $source" >&2
    exit 1
  fi
  cp "$license" "$OUT/$slug.OFL.txt"

  printf '%-24s %6s KB  ←  %s (%s KB)\n' "$slug.woff2" \
    "$(( $(wc -c < "$OUT/$slug.woff2") / 1024 ))" "$source" "$(( $(wc -c < "$ttf") / 1024 ))"
done <<'EOF'
bodoni-moda|BodoniModa[opsz,wght].ttf|-|site
hanken-grotesk|HankenGrotesk[wght].ttf|-|site
playfair-display|PlayfairDisplay[wght].ttf|wght=500|lab
cormorant-garamond|CormorantGaramond[wght].ttf|wght=600|lab
eb-garamond|EBGaramond[wght].ttf|wght=500|lab
libre-baskerville|LibreBaskerville[wght].ttf|wght=400|lab
cinzel|Cinzel[wght].ttf|wght=500|lab
cinzel-decorative|CinzelDecorative-Regular.ttf|-|lab
abril-fatface|AbrilFatface-Regular.ttf|-|lab
bebas-neue|BebasNeue-Regular.ttf|-|lab
oswald|Oswald[wght].ttf|wght=500|lab
montserrat|Montserrat[wght].ttf|wght=500|lab
josefin-sans|JosefinSans[wght].ttf|wght=500|lab
raleway|Raleway[wght].ttf|wght=500|lab
pinyon-script|PinyonScript-Regular.ttf|-|lab
great-vibes|GreatVibes-Regular.ttf|-|lab
dancing-script|DancingScript[wght].ttf|wght=500|lab
allura|Allura-Regular.ttf|-|lab
space-mono|SpaceMono-Regular.ttf|-|lab
EOF
