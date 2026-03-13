#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Uso: $0 https://<tunnel-host>" >&2
  exit 1
fi

tunnel_url="${1%/}"

if [[ ! "$tunnel_url" =~ ^https:// ]]; then
  echo "La URL debe empezar con https://" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
files=(
  "$repo_root/vercel.json"
  "$repo_root/frontend/vercel.json"
)

for file in "${files[@]}"; do
  perl -0pi -e 's#https://[^"]+?/api/v1/:path\*#'"$tunnel_url"'/api/v1/:path*#g' "$file"
done

echo "Tunnel actualizado en:"
printf ' - %s\n' "${files[@]}"
echo "Destino nuevo: $tunnel_url/api/v1/:path*"
