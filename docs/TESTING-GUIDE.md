# RahulOps - Testing Guide

This guide explains how to test the deployment scripts on your Hostinger VPS servers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing Server Setup Script](#testing-server-setup-script)
3. [Testing Site Deployment Script](#testing-site-deployment-script)
4. [Testing Backup Script](#testing-backup-script)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Production Checklist](#production-checklist)

---

## Prerequisites

### Server Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| RAM | 4 GB | 8+ GB |
| CPU | 2 cores | 4+ cores |
| Storage | 40 GB SSD | 80+ GB SSD |
| Network | Static IP | Static IP + Domain |

### Before You Start

1. **Fresh VPS**: Start with a clean Ubuntu installation
2. **Root Access**: You need root or sudo access
3. **SSH Access**: Ensure you can SSH into the server
4. **Domain (optional)**: For SSL testing, point a domain to your server IP

### Connect to Your Server

```bash
# Replace with your server IP
ssh root@YOUR_SERVER_IP

# Or if you have a specific user
ssh username@YOUR_SERVER_IP
```

---

## Testing Server Setup Script

### Step 1: Download the Script

```bash
# Create a directory for scripts
mkdir -p /root/erpnext-scripts
cd /root/erpnext-scripts

# Download the server setup script (or copy from your local machine)
# Option A: Using wget (if hosted)
# wget https://raw.githubusercontent.com/yourusername/erpnext-deployer/main/scripts/server-setup.sh

# Option B: Create manually
nano server-setup.sh
# Paste the script content and save (Ctrl+O, Enter, Ctrl+X)

# Make executable
chmod +x server-setup.sh
```

### Step 2: Configure Environment Variables

You can either edit the script or set environment variables:

```bash
# Option A: Set environment variables before running
export FRAPPE_USER="frappe"
export MARIADB_ROOT_PASSWORD="YourSecurePassword123!"
export BENCH_NAME="frappe-bench"
export FRAPPE_BRANCH="version-15"
export ADMIN_EMAIL="admin@yourdomain.com"

# Choose which apps to install (space-separated)
export APPS_TO_INSTALL="erpnext hrms payments india_compliance"

# Custom apps (optional) - format: "name|branch|url"
export CUSTOM_APPS="Trustbit|main|https://github.com/teambackoffice/Trustbit.git"
```

### Step 3: Run the Setup Script

```bash
# Run with sudo
sudo ./server-setup.sh

# Or run as root
./server-setup.sh
```

### Step 4: Monitor Progress

The script will:
1. Update system packages (2-5 minutes)
2. Create frappe user
3. Install dependencies (5-10 minutes)
4. Install MariaDB
5. Install Node.js
6. Initialize Frappe Bench (5-10 minutes)
7. Install apps (10-20 minutes depending on selection)
8. Configure production environment

**Total estimated time: 30-45 minutes**

### Step 5: Verify Installation

```bash
# Check if frappe user exists
id frappe

# Check if bench is installed
su - frappe -c "which bench"

# Check bench status
su - frappe -c "cd frappe-bench && bench version"

# Check installed apps
su - frappe -c "cd frappe-bench && ls apps/"

# Check supervisor status
sudo supervisorctl status

# Check nginx status
sudo nginx -t
sudo systemctl status nginx
```

### Step 6: Check Credentials File

```bash
# View saved credentials
cat /home/frappe/server-credentials.txt

# View JSON result
cat /home/frappe/setup-result.json
```

### Expected Output

```
╔═══════════════════════════════════════════════════════════════╗
║                    SETUP COMPLETE!                            ║
╠═══════════════════════════════════════════════════════════════╣
║  Duration: 35m 42s
║  Log file: /var/log/erpnext-setup-20241224-100000.log
║  Credentials: /home/frappe/server-credentials.txt
║
║  Next steps:
║  1. Save credentials securely
║  2. Create your first site:
║     bench new-site yoursite.com
╚═══════════════════════════════════════════════════════════════╝
```

---

## Testing Site Deployment Script

### Prerequisites
- Server setup completed successfully
- Domain pointing to server IP (for SSL)

### Step 1: Download Site Deploy Script

```bash
cd /root/erpnext-scripts

# Create the site deployment script
nano site-deploy.sh
# Paste content and save

chmod +x site-deploy.sh
```

### Step 2: Configure for Test Site

```bash
# Required variables
export SITE_NAME="test.yourdomain.com"
export MARIADB_ROOT_PASSWORD="YourMariaDBPassword"  # From server setup
export FRAPPE_USER="frappe"
export BENCH_PATH="/home/frappe/frappe-bench"

# Apps to install on this site
export SITE_APPS="erpnext hrms payments"

# SSL configuration
export SETUP_SSL="true"
export SSL_EMAIL="admin@yourdomain.com"
```

### Step 3: Run Site Deployment

```bash
sudo ./site-deploy.sh
```

### Step 4: Monitor Deployment

Watch the progress:
```bash
# In another terminal, watch the progress file
tail -f /tmp/deployment-progress.json
```

### Step 5: Verify Site

```bash
# Check site exists
ls -la /home/frappe/frappe-bench/sites/

# Check site config
cat /home/frappe/frappe-bench/sites/test.yourdomain.com/site_config.json

# Test site access (internal)
su - frappe -c "cd frappe-bench && bench --site test.yourdomain.com doctor"

# Check nginx config for site
grep -r "test.yourdomain.com" /etc/nginx/

# Test in browser
curl -I https://test.yourdomain.com
```

### Step 6: Access the Site

1. Open browser: `https://test.yourdomain.com`
2. Login with:
   - Username: `Administrator`
   - Password: (from deployment output or result JSON)

### Test Site Deployment Results

```bash
# View deployment result
cat /tmp/site-result-test.yourdomain.com.json
```

Expected output:
```json
{
    "status": "success",
    "site_name": "test.yourdomain.com",
    "site_url": "https://test.yourdomain.com",
    "admin_user": "Administrator",
    "admin_password": "GeneratedPassword123!",
    "installed_apps": "erpnext hrms payments",
    "ssl_enabled": true
}
```

---

## Testing Backup Script

### Step 1: Setup Backup Script

```bash
cd /root/erpnext-scripts

nano backup-manager.sh
# Paste content and save

chmod +x backup-manager.sh
```

### Step 2: Create Backup Directory

```bash
mkdir -p /home/frappe/backups
chown frappe:frappe /home/frappe/backups
```

### Step 3: Test Manual Backup

```bash
# Backup a specific site
export ACTION="backup"
export SITE_NAME="test.yourdomain.com"
export FRAPPE_USER="frappe"
export BENCH_PATH="/home/frappe/frappe-bench"
export BACKUP_DIR="/home/frappe/backups"

sudo ./backup-manager.sh
```

### Step 4: Test Backup All Sites

```bash
export ACTION="backup"
unset SITE_NAME  # Clear to backup all

sudo ./backup-manager.sh
```

### Step 5: List Backups

```bash
export ACTION="list"
export SITE_NAME="test.yourdomain.com"

./backup-manager.sh
```

### Step 6: Test Restore (Careful!)

```bash
# First, create a test restore point
export ACTION="backup"
export SITE_NAME="test.yourdomain.com"
./backup-manager.sh

# Note the backup path, then restore
export ACTION="restore"
export SITE_NAME="test.yourdomain.com"
export RESTORE_FILE="/home/frappe/backups/test.yourdomain.com/20241224-100000"

./backup-manager.sh
```

### Step 7: Test Cleanup Old Backups

```bash
export ACTION="delete-old"
export RETENTION_DAYS="7"

./backup-manager.sh
```

---

## Troubleshooting Common Issues

### Issue: "bench: command not found"

```bash
# Fix: Add bench to PATH
echo 'export PATH=$PATH:/home/frappe/.local/bin' >> /home/frappe/.bashrc
source /home/frappe/.bashrc
```

### Issue: MariaDB Connection Refused

```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Restart if needed
sudo systemctl restart mariadb

# Check authentication
mysql -u root -p
```

### Issue: Nginx Configuration Error

```bash
# Test nginx config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Regenerate nginx config
su - frappe -c "cd frappe-bench && bench setup nginx --yes"
sudo systemctl reload nginx
```

### Issue: SSL Certificate Failed

```bash
# Check if domain points to server
dig +short yourdomain.com

# Manually request certificate
sudo certbot --nginx -d yourdomain.com

# Check certificate status
sudo certbot certificates
```

### Issue: Supervisor Not Starting Workers

```bash
# Check supervisor status
sudo supervisorctl status

# View supervisor logs
sudo tail -f /var/log/supervisor/supervisord.log

# Restart all
sudo supervisorctl restart all

# If config missing, regenerate
su - frappe -c "cd frappe-bench && bench setup supervisor --yes"
sudo supervisorctl reread
sudo supervisorctl update
```

### Issue: Site Showing "Site Not Found"

```bash
# Check site directory
ls -la /home/frappe/frappe-bench/sites/

# Check currentsite.txt
cat /home/frappe/frappe-bench/sites/currentsite.txt

# Check nginx config has site
grep -r "server_name" /etc/nginx/conf.d/

# Regenerate nginx
su - frappe -c "cd frappe-bench && bench setup nginx --yes"
sudo nginx -t && sudo systemctl reload nginx
```

### Issue: Permission Denied Errors

```bash
# Fix bench directory permissions
sudo chown -R frappe:frappe /home/frappe/frappe-bench
chmod -R o+rx /home/frappe

# Fix log directory permissions
sudo mkdir -p /home/frappe/frappe-bench/logs
sudo chown -R frappe:frappe /home/frappe/frappe-bench/logs
```

### Issue: Out of Memory (OOM)

```bash
# Check memory usage
free -h

# Add swap space (if not present)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Production Checklist

### Security Checklist

- [ ] Change default MariaDB root password
- [ ] Disable SSH password authentication (use keys)
- [ ] Configure firewall (UFW)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Remove credentials file after saving securely
- [ ] Set up fail2ban for SSH protection
- [ ] Enable automatic security updates

### Performance Checklist

- [ ] Configure MariaDB for production
- [ ] Set up Redis caching properly
- [ ] Configure proper worker counts
- [ ] Enable gzip compression in nginx
- [ ] Set up CDN for static files (optional)

### Backup Checklist

- [ ] Test backup script
- [ ] Set up automated daily backups
- [ ] Configure off-site backup storage
- [ ] Test restore procedure
- [ ] Document backup locations

### Monitoring Checklist

- [ ] Set up server monitoring (CPU, RAM, Disk)
- [ ] Configure log rotation
- [ ] Set up uptime monitoring
- [ ] Configure email alerts for issues

---

## Quick Test Commands

```bash
# === Server Health ===
# Check CPU usage
top -bn1 | head -5

# Check memory
free -h

# Check disk space
df -h

# === Frappe/ERPNext ===
# Switch to frappe user
su - frappe
cd frappe-bench

# Check bench version
bench version

# List sites
bench --site all list-apps

# Check site status
bench --site SITENAME doctor

# Run scheduler manually
bench --site SITENAME scheduler

# Clear cache
bench --site SITENAME clear-cache

# === Services ===
# Restart all services
sudo supervisorctl restart all

# Reload nginx
sudo systemctl reload nginx

# Check MariaDB
sudo systemctl status mariadb

# Check Redis
sudo systemctl status redis-server
```

---

## Getting Help

If you encounter issues not covered here:

1. Check the log files:
   - Setup log: `/var/log/erpnext-setup-*.log`
   - Frappe logs: `/home/frappe/frappe-bench/logs/`
   - Nginx logs: `/var/log/nginx/`
   - Supervisor logs: `/var/log/supervisor/`

2. Run bench doctor:
   ```bash
   su - frappe -c "cd frappe-bench && bench --site SITENAME doctor"
   ```

3. Check Frappe documentation: https://frappeframework.com/docs

4. ERPNext documentation: https://docs.erpnext.com
