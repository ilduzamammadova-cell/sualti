#!/usr/bin/env bash
# demo/ qovluğunu ictimai sayt reposuna (sualti) köçürür və push edir.
# Hər fayla ?v=<versiya> əlavə olunur ki, brauzer keşdəki köhnə JS/CSS-i istifadə etməsin
# (GitHub Pages faylları 10 dəqiqə keşləyir).
# Brief, baza, araşdırma və alətlər də sayt reposuna köçürülür (sirlər — .env — heç vaxt).
# İstifadə: tools/publish-site.sh ../sualti-site "commit mesajı"
set -euo pipefail
SITE="${1:?sayt reposunun yolu}"; MSG="${2:-Update site}"
VER="$(date +%Y%m%d%H%M%S)"
rsync -a --delete --exclude .git --exclude README.md --exclude .nojekyll --exclude .gitignore \
  --exclude BRIEF.md --exclude db --exclude research --exclude tools demo/ "$SITE/"
for d in db research tools; do
  rsync -a --delete --exclude .env --exclude '*.env' --exclude __pycache__ "$d/" "$SITE/$d/"
done
cp BRIEF.md "$SITE/BRIEF.md"
# yerli fayl istinadlarına versiya əlavə et (xarici linklərə toxunma)
sed -E -i '' \
  -e 's#(src|href)="((questions|mascot|art|countries|sound|challenges|app|party|duo)\.js|styles\.css)"#\1="\2?v='"$VER"'"#g' \
  "$SITE/index.html"
cd "$SITE"
git add -A
git commit -q -m "$MSG" || { echo "dəyişiklik yoxdur"; exit 0; }
git push -q origin main
echo "push olundu, versiya $VER"
