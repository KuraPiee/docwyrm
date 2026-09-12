#!/usr/bin/env bash
# ==============================================================================
# Docwyrm VDS Production Automated Setup Script (docwyrm.com)
# ==============================================================================
set -euo pipefail

echo "==> [1/5] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

echo "==> [2/5] Ensuring Node.js 20+ & pnpm are installed..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
npm install -g pnpm pm2

echo "==> [3/5] Installing project dependencies & building production bundle..."
pnpm install --frozen-lockfile
pnpm --filter api build
pnpm --filter web build

echo "==> [4/5] Setting up PM2 Process Management..."
cat << 'EOF' > ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'docwyrm-api',
      cwd: './apps/api',
      script: 'node',
      args: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        FRONTEND_URL: 'https://docwyrm.com'
      }
    },
    {
      name: 'docwyrm-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd || true

echo "==> [5/5] Configuring Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/docwyrm.com
ln -sf /etc/nginx/sites-available/docwyrm.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=============================================================================="
echo "🎉 Docwyrm production deployment complete!"
echo "Next step: Run 'certbot --nginx -d docwyrm.com -d www.docwyrm.com' for SSL."
echo "=============================================================================="
