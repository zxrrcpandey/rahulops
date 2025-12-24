# RahulOps - Complete Step-by-Step Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create Required Accounts](#2-create-required-accounts)
3. [Setup Supabase Database](#3-setup-supabase-database)
4. [Setup Trigger.dev](#4-setup-triggerdev)
5. [Setup Resend Email](#5-setup-resend-email)
6. [Deploy to Vercel](#6-deploy-to-vercel)
7. [Configure Environment Variables](#7-configure-environment-variables)
8. [First Login & Setup](#8-first-login--setup)
9. [Add Your First Server](#9-add-your-first-server)
10. [Setup Server (Run Script)](#10-setup-server-run-script)
11. [Deploy First Client Site](#11-deploy-first-client-site)
12. [Configure DNS](#12-configure-dns)
13. [Test Everything](#13-test-everything)
14. [Going Live Checklist](#14-going-live-checklist)

---

## 1. Prerequisites

### What You Need Before Starting

| Requirement | Details |
|-------------|---------|
| **GitHub Account** | For code repository |
| **Email Address** | For service signups |
| **Hostinger VPS** | Ubuntu 22.04/24.04, minimum 4GB RAM |
| **Domain Name** | For your dashboard and client sites |
| **30-45 minutes** | Time to complete setup |

### Recommended VPS Specifications

| Clients | RAM | CPU | Storage |
|---------|-----|-----|---------|
| 1-5 sites | 4 GB | 2 vCPU | 80 GB SSD |
| 5-15 sites | 8 GB | 4 vCPU | 160 GB SSD |
| 15-30 sites | 16 GB | 6 vCPU | 320 GB SSD |

---

## 2. Create Required Accounts

### 2.1 Supabase (Database - FREE)

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name**: `rahulops`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your clients (e.g., Mumbai)
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup

📝 **Save these (Settings → API):**
- Project URL: `https://xxxxx.supabase.co`
- anon/public key: `eyJhbG...`
- service_role key: `eyJhbG...` (keep secret!)

---

### 2.2 Vercel (Hosting - FREE)

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

✅ Account created! We'll deploy later.

---

### 2.3 Trigger.dev (Background Jobs - FREE)

1. Go to [https://cloud.trigger.dev](https://cloud.trigger.dev)
2. Click **"Sign up"**
3. Sign up with GitHub
4. Create organization: `rahulops`
5. Create project: `rahulops`

📝 **Save these (Settings → API Keys):**
- API Key: `tr_dev_xxxx...`

---

### 2.4 Resend (Email - FREE)

1. Go to [https://resend.com](https://resend.com)
2. Click **"Sign Up"**
3. Sign up with GitHub
4. Go to **API Keys**
5. Click **"Create API Key"**
   - Name: `rahulops`
   - Permission: Full access
6. Copy the API key (shown only once!)

📝 **Save this:**
- API Key: `re_xxxx...`

---

### 2.5 Cloudflare (DNS - FREE) [Optional but Recommended]

1. Go to [https://cloudflare.com](https://cloudflare.com)
2. Sign up for free account
3. Add your domain
4. Update nameservers at your registrar
5. Go to **My Profile → API Tokens**
6. Create token with **Zone:DNS:Edit** permission

📝 **Save these:**
- API Token: `xxxx...`
- Zone ID: Found on domain overview page

---

## 3. Setup Supabase Database

### 3.1 Open SQL Editor

1. Go to your Supabase project
2. Click **"SQL Editor"** in sidebar
3. Click **"New query"**

### 3.2 Run Database Schema

Copy and paste this entire SQL (this creates all tables):

```sql
-- ============================================================================
-- RAHULOPS DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SERVERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    ssh_user VARCHAR(100) DEFAULT 'root',
    ssh_port INTEGER DEFAULT 22,
    ssh_key_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    location VARCHAR(255),
    provider VARCHAR(100) DEFAULT 'hostinger',
    bench_path VARCHAR(500) DEFAULT '/home/frappe/frappe-bench',
    frappe_version VARCHAR(20) DEFAULT '15',
    max_sites INTEGER DEFAULT 10,
    installed_apps TEXT[],
    health_status VARCHAR(50) DEFAULT 'unknown',
    cpu_usage DECIMAL(5,2),
    ram_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    last_health_check TIMESTAMPTZ,
    setup_completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SITES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name VARCHAR(255) NOT NULL UNIQUE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    admin_password VARCHAR(255),
    apps TEXT[],
    ssl_enabled BOOLEAN DEFAULT false,
    ssl_expiry TIMESTAMPTZ,
    scheduler_enabled BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    suspended_at TIMESTAMPTZ,
    suspension_reason TEXT,
    deployment_started_at TIMESTAMPTZ,
    deployment_completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    plan VARCHAR(100) DEFAULT 'starter',
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    status VARCHAR(50) DEFAULT 'active',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BACKUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'full',
    status VARCHAR(50) DEFAULT 'pending',
    file_path TEXT,
    file_size BIGINT,
    remote_path TEXT,
    triggered_by VARCHAR(100) DEFAULT 'manual',
    schedule_id UUID,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BACKUP SCHEDULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS backup_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    frequency VARCHAR(50) DEFAULT 'daily',
    backup_type VARCHAR(50) DEFAULT 'full',
    retention_days INTEGER DEFAULT 30,
    enabled BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEPLOYMENT JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployment_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_step TEXT,
    error_message TEXT,
    trigger_job_id VARCHAR(255),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    user_id UUID,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SSH KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ssh_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    public_key TEXT NOT NULL,
    private_key_encrypted TEXT,
    fingerprint VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEAM MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'invited',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sites_client ON sites(client_id);
CREATE INDEX IF NOT EXISTS idx_sites_server ON sites(server_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_backups_site ON backups(site_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ============================================================================
-- DEFAULT SETTINGS
-- ============================================================================
INSERT INTO settings (key, value) VALUES
    ('auto_suspension', '{"enabled": true, "grace_period": 3}'),
    ('reminder_settings', '{"enabled": true, "days": [14, 7, 3, 1]}'),
    ('backup_settings', '{"default_retention": 30, "remote_storage": null}'),
    ('email_settings', '{"from_name": "RahulOps", "reply_to": null}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust as needed)
CREATE POLICY "Allow authenticated access" ON servers FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON clients FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON sites FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON backups FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON activity_log FOR ALL USING (true);
CREATE POLICY "Allow authenticated access" ON settings FOR ALL USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### 3.3 Create Admin User

1. Go to **Authentication → Users**
2. Click **"Add user"**
3. Enter:
   - Email: `your@email.com`
   - Password: Strong password
4. Click **"Create user"**

✅ Database is ready!

---

## 4. Setup Trigger.dev

### 4.1 Install Trigger.dev CLI (Later)

We'll configure this after deploying to Vercel. For now, just have your API key ready.

---

## 5. Setup Resend Email

### 5.1 Verify Domain (Recommended)

1. Go to Resend Dashboard → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `rahulops.com`)
4. Add the DNS records shown to your domain
5. Click **"Verify"**

### 5.2 Or Use Default

For testing, you can use Resend's default `onboarding@resend.dev` sender.

---

## 6. Deploy to Vercel

### 6.1 Upload Code to GitHub

1. Download the `rahulops.zip` file
2. Extract it
3. Open terminal in the folder:

```bash
cd rahulops

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial RahulOps setup"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rahulops.git
git branch -M main
git push -u origin main
```

### 6.2 Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import"** next to your `rahulops` repo
3. Configure project:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
4. Click **"Deploy"**
5. Wait for deployment (2-3 minutes)

📝 **Save your Vercel URL:** `https://rahulops-xxxxx.vercel.app`

---

## 7. Configure Environment Variables

### 7.1 Add Variables in Vercel

1. Go to your Vercel project
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | All |
| `TRIGGER_API_KEY` | `tr_dev_xxx...` | All |
| `TRIGGER_API_URL` | `https://api.trigger.dev` | All |
| `RESEND_API_KEY` | `re_xxx...` | All |
| `EMAIL_FROM` | `noreply@yourdomain.com` | All |
| `NOTIFICATION_EMAIL` | `your@email.com` | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | All |
| `NEXT_PUBLIC_APP_NAME` | `RahulOps` | All |
| `SSL_EMAIL` | `your@email.com` | All |
| `DEFAULT_DOMAIN` | `yourdomain.com` | All |
| `ENCRYPTION_KEY` | Generate 32 random chars | All |
| `CRON_SECRET` | Generate random string | All |

### 7.2 Generate Random Keys

```bash
# Run in terminal to generate ENCRYPTION_KEY
openssl rand -base64 32

# Run for CRON_SECRET
openssl rand -hex 16
```

### 7.3 Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

✅ Dashboard is live!

---

## 8. First Login & Setup

### 8.1 Access Dashboard

1. Go to `https://your-app.vercel.app`
2. You'll see the login page
3. Enter your Supabase user credentials
4. Click **"Sign in"**

### 8.2 Initial Configuration

1. Go to **Settings** in sidebar
2. Configure:
   - **Company Name**: Your company
   - **Default Domain**: Your base domain for subdomains
   - **Email Settings**: Verify sender email
   - **Auto-Suspension**: Enable/disable, set grace period

---

## 9. Add Your First Server

### 9.1 Get VPS Details

From your Hostinger panel, get:
- IP Address
- Root password (or SSH key)

### 9.2 Add Server in Dashboard

1. Go to **Servers** → **Add Server**
2. Fill in:
   - **Name**: `Mumbai-1` (or your choice)
   - **IP Address**: Your VPS IP
   - **SSH User**: `root` (initially)
   - **SSH Port**: `22`
   - **Location**: `Mumbai, India`
   - **Max Sites**: `10` (based on RAM)
3. Click **"Add Server"**

---

## 10. Setup Server (Run Script)

### 10.1 Connect to VPS

```bash
ssh root@YOUR_VPS_IP
```

### 10.2 Download Setup Script

```bash
# Download the server setup script
wget https://raw.githubusercontent.com/YOUR_USERNAME/rahulops/main/scripts/server-setup.sh

# Make executable
chmod +x server-setup.sh
```

### 10.3 Configure Script

Edit the script to set your preferences:

```bash
nano server-setup.sh
```

Set these variables at the top:
```bash
FRAPPE_USER="frappe"
MARIADB_ROOT_PASSWORD="YourSecurePassword123!"
ADMIN_EMAIL="your@email.com"
```

### 10.4 Run Setup Script

```bash
sudo ./server-setup.sh
```

⏱️ **This takes 30-45 minutes.** The script will:
- Update system
- Install dependencies
- Install MariaDB, Redis, Node.js
- Install Frappe Bench
- Download ERPNext apps
- Setup nginx and supervisor

### 10.5 Verify Installation

```bash
# Switch to frappe user
su - frappe

# Go to bench directory
cd frappe-bench

# Check bench status
bench --version

# List apps
ls apps/
```

Expected output:
```
frappe-bench 5.x.x
erpnext  frappe  hrms  payments  ...
```

### 10.6 Update Server Status

Back in RahulOps dashboard:
1. Go to **Servers**
2. Click on your server
3. Click **"Mark as Active"**

---

## 11. Deploy First Client Site

### 11.1 Add Client

1. Go to **Clients** → **Add Client**
2. Fill in:
   - **Name**: Client name
   - **Email**: Client email
   - **Company**: Company name
   - **Phone**: Contact number
3. Click **"Create Client"**

### 11.2 Deploy Site

1. Go to **Sites** → **Deploy New Site**
2. **Step 1 - Client**: Select your client
3. **Step 2 - Domain**:
   - Choose **Subdomain** or **Custom Domain**
   - Enter: `clientname` (for clientname.yourdomain.com)
4. **Step 3 - Server**: Select your server
5. **Step 4 - Apps**: Select apps to install:
   - ✅ ERPNext (required)
   - ✅ HRMS
   - ✅ Payments
   - ✅ Any other needed apps
6. **Step 5 - Review**: Verify and click **"Deploy"**

### 11.3 Monitor Deployment

1. You'll see deployment progress
2. Steps: Creating site → Installing apps → Configuring nginx → SSL
3. Takes about 5-10 minutes

### 11.4 Manual Deployment (Alternative)

If auto-deploy doesn't work, SSH to server:

```bash
su - frappe
cd frappe-bench

# Create site
bench new-site clientname.yourdomain.com --admin-password 'SecurePassword123'

# Install apps
bench --site clientname.yourdomain.com install-app erpnext
bench --site clientname.yourdomain.com install-app hrms

# Setup nginx
bench setup nginx
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d clientname.yourdomain.com
```

---

## 12. Configure DNS

### 12.1 For Subdomains

Add A record in your DNS (Cloudflare/GoDaddy/etc.):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `clientname` | `YOUR_VPS_IP` | Auto |

Or add wildcard for all subdomains:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `*` | `YOUR_VPS_IP` | Auto |

### 12.2 For Custom Domains

Client needs to add A record pointing to your server IP:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `erp` | `YOUR_VPS_IP` | Auto |

---

## 13. Test Everything

### 13.1 Test Site Access

1. Open `https://clientname.yourdomain.com`
2. You should see ERPNext login page
3. Login with:
   - Username: `Administrator`
   - Password: The password you set

### 13.2 Test Dashboard Features

| Feature | Test |
|---------|------|
| **Health Check** | Server shows CPU/RAM/Disk stats |
| **Backup** | Create manual backup, verify it completes |
| **Activity Log** | Actions appear in activity feed |
| **Client Management** | Add/edit client, verify changes |

### 13.3 Test Email

1. Go to **Billing**
2. Click **"Send Reminder"** on a subscription
3. Check if email is received

### 13.4 Test Auto-Suspension

1. Create a test subscription with past expiry date
2. Wait for cron job (or trigger manually)
3. Verify site shows as suspended

---

## 14. Going Live Checklist

### Security

- [ ] Change default passwords
- [ ] Setup SSH key authentication (disable password)
- [ ] Configure firewall (UFW)
- [ ] Install fail2ban
- [ ] Enable automatic security updates

```bash
# On your VPS
# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### Backups

- [ ] Configure daily automatic backups
- [ ] Setup remote backup storage (S3/GCS)
- [ ] Test backup restoration

### Monitoring

- [ ] Verify health checks are running
- [ ] Setup uptime monitoring (UptimeRobot - free)
- [ ] Configure alert notifications

### Documentation

- [ ] Document client onboarding process
- [ ] Create client handover template
- [ ] Document pricing and plans

---

## 🎉 Congratulations!

Your **RahulOps** platform is now live and ready to serve clients!

### Quick Reference

| Task | Location |
|------|----------|
| Add new server | Dashboard → Servers → Add |
| Deploy site | Dashboard → Sites → Deploy |
| Add client | Dashboard → Clients → Add |
| View backups | Dashboard → Backups |
| Check billing | Dashboard → Billing |
| View logs | Dashboard → Activity |
| Settings | Dashboard → Settings |

### Support Resources

- **ERPNext Docs**: https://docs.erpnext.com
- **Frappe Docs**: https://frappeframework.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Troubleshooting Common Issues

### Site not accessible after deployment

```bash
# Check nginx config
sudo nginx -t

# Check if site exists
bench --site sitename list-apps

# Check DNS propagation
dig sitename.yourdomain.com
```

### SSL certificate failed

```bash
# Retry certbot
sudo certbot --nginx -d sitename.yourdomain.com

# Check if port 80/443 is open
sudo ufw status
```

### Database connection error

```bash
# Check MariaDB status
sudo systemctl status mariadb

# Test connection
mysql -u root -p
```

### Bench command not found

```bash
# Add to path
export PATH=$PATH:/home/frappe/.local/bin

# Or run with full path
/home/frappe/.local/bin/bench
```

---

**Need help?** Open an issue on GitHub or contact support.

*Built with ❤️ by Rahul*
