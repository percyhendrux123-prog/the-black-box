#!/usr/bin/env bash
# THE BLACK BOX — v1.0 ship script
# Idempotent: safe to re-run. Each step is a checkpoint.

set -euo pipefail

cd "$(dirname "$0")"
echo "▸ pwd = $(pwd)"

# ── 1. Install ─────────────────────────────────────────────────
echo "▸ npm install"
# Wipe any partial node_modules from the sandbox attempt.
rm -rf node_modules package-lock.json
npm install --no-fund --no-audit

# ── 2. Build ───────────────────────────────────────────────────
echo "▸ npm run build"
npm run build

# ── 3. Git init + first commit ─────────────────────────────────
if [ ! -d .git ]; then
  echo "▸ git init"
  git init -b main
  git add -A
  git -c user.name="Percy" -c user.email="percyhendrux123@gmail.com" \
    commit -m "Initial port of THE BLACK BOX v3 mockup to React"
else
  echo "▸ git already initialized"
fi

# ── 4. GitHub repo (idempotent) ────────────────────────────────
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "▸ gh repo create the-black-box"
  gh repo create the-black-box --public --source=. --remote=origin --push
else
  echo "▸ origin already set: $(git remote get-url origin)"
  git push -u origin main || true
fi

# ── 5. Netlify init + deploy ───────────────────────────────────
SITE_NAME="the-black-box"
if [ ! -f .netlify/state.json ]; then
  echo "▸ netlify sites:create --name=$SITE_NAME"
  # Try preferred name; on collision, try fallbacks.
  if ! netlify sites:create --name="$SITE_NAME" --with-ci; then
    SITE_NAME="the-black-box-app"
    echo "▸ falling back to: $SITE_NAME"
    if ! netlify sites:create --name="$SITE_NAME" --with-ci; then
      SITE_NAME="the-black-box-v1"
      echo "▸ falling back to: $SITE_NAME"
      netlify sites:create --name="$SITE_NAME" --with-ci
    fi
  fi
  netlify link --name="$SITE_NAME"
fi

echo "▸ netlify deploy --prod --dir=dist"
netlify deploy --prod --dir=dist

# ── 6. Wire auto-deploy via GitHub ─────────────────────────────
# netlify init wires the GitHub repo for auto-deploy on push.
echo "▸ wiring GitHub auto-deploy"
netlify init || true   # idempotent, prompts if needed

echo "✓ ship complete — check the URL above."
