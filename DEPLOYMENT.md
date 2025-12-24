# RahulOps Deployment Guide

## Quick Deploy to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial RahulOps setup"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/rahulops.git

# Push
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your `rahulops` repository
4. Configure environment variables (see below)
5. Click **"Deploy"**

### Step 3: Set Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TRIGGER_API_KEY=tr_dev_...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
NOTIFICATION_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
SSL_EMAIL=admin@yourdomain.com
DEFAULT_DOMAIN=yourdomain.com
ENCRYPTION_KEY=your-32-char-key
CRON_SECRET=your-random-cron-secret
```

### Step 4: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to SQL Editor
3. Copy the contents of `supabase/schema.sql` and run it
4. Get your API keys from Settings → API

### Step 5: Setup Trigger.dev

1. Go to [trigger.dev](https://trigger.dev) and create an account
2. Create a new project named "rahulops"
3. Get your API key from Settings
4. Deploy your trigger jobs:

```bash
npx trigger.dev deploy
```

### Step 6: Setup Resend (Email)

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain
3. Get your API key from API Keys section

### Step 7: Configure Vercel Cron Jobs

The `vercel.json` file already includes cron job configurations. They will run automatically:
- Health Check: Every 5 minutes
- Auto-Suspend: Daily at midnight
- Backup Scheduler: Daily at 2 AM
- Send Reminders: Daily at 9 AM

Add `CRON_SECRET` environment variable in Vercel for security.

---

## Manual Deployment (VPS)

### Prerequisites

- Ubuntu 22.04 LTS
- Node.js 18+
- PM2 (for process management)

### Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/rahulops.git
cd rahulops

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your values

# Build
npm run build

# Start with PM2
pm2 start npm --name "rahulops" -- start

# Setup nginx reverse proxy (optional)
sudo nano /etc/nginx/sites-available/rahulops

# Add:
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/rahulops /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Certbot
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test login functionality
- [ ] Add first server
- [ ] Test site deployment
- [ ] Verify email notifications
- [ ] Test backup functionality
- [ ] Configure DNS for client subdomains
- [ ] Setup monitoring/alerting

---

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

- Verify Supabase URL and keys
- Check if RLS policies are correct
- Ensure service role key is used for server-side operations

### Email Not Sending

- Verify Resend API key
- Check if sender domain is verified
- Review Resend logs for errors

### Cron Jobs Not Running

- Verify `CRON_SECRET` is set
- Check Vercel logs for errors
- Ensure routes are accessible

---

## Support

For issues, please open a GitHub issue or contact support.
