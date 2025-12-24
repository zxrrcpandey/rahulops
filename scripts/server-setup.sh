#!/bin/bash
# ============================================================================
# ERPNext Multi-Tenant Server Setup Script
# Version: 2.0
# Description: Non-interactive script to set up a fresh Ubuntu server with
#              Frappe Bench and all required apps for multi-tenant deployment
# ============================================================================

set -e  # Exit on any error

# ============================================================================
# CONFIGURATION - Pass these as environment variables or modify defaults
# ============================================================================
FRAPPE_USER="${FRAPPE_USER:-frappe}"
FRAPPE_USER_PASSWORD="${FRAPPE_USER_PASSWORD:-}"
MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD:-$(openssl rand -base64 24)}"
BENCH_NAME="${BENCH_NAME:-frappe-bench}"
FRAPPE_BRANCH="${FRAPPE_BRANCH:-version-15}"
NODE_VERSION="${NODE_VERSION:-18}"
PYTHON_VERSION="${PYTHON_VERSION:-3.10}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"

# Apps to install (space-separated)
# Available apps: erpnext, hrms, payments, webshop, india_compliance, 
#                 healthcare, education, lending, hospitality, agriculture, non_profit
APPS_TO_INSTALL="${APPS_TO_INSTALL:-erpnext hrms payments webshop india_compliance healthcare education}"

# Custom apps (format: "app_name|branch|repo_url" separated by spaces)
# Example: "Trustbit|main|https://github.com/teambackoffice/Trustbit.git"
CUSTOM_APPS="${CUSTOM_APPS:-Trustbit|main|https://github.com/teambackoffice/Trustbit.git}"

# Additional/Optional apps (can be installed per-site later)
# These are popular ERPNext ecosystem apps
OPTIONAL_APPS="lending hospitality agriculture non_profit crm wiki"

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================
LOG_FILE="/var/log/erpnext-setup-$(date +%Y%m%d-%H%M%S).log"

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$1"; }
log_success() { log "SUCCESS" "$1"; }
log_warning() { log "WARNING" "$1"; }
log_error() { log "ERROR" "$1"; }

step_start() {
    echo ""
    echo "=============================================="
    log_info "STEP: $1"
    echo "=============================================="
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================
preflight_checks() {
    step_start "Running pre-flight checks"
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root"
        exit 1
    fi
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_error "This script is designed for Ubuntu. Detected: $(cat /etc/os-release | grep PRETTY_NAME)"
        exit 1
    fi
    
    # Check minimum RAM (4GB recommended)
    total_ram=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$total_ram" -lt 3 ]; then
        log_warning "Less than 4GB RAM detected. ERPNext may run slowly."
    fi
    
    # Check if frappe user password is set
    if [ -z "$FRAPPE_USER_PASSWORD" ]; then
        FRAPPE_USER_PASSWORD=$(openssl rand -base64 12)
        log_info "Generated random password for frappe user"
    fi
    
    log_success "Pre-flight checks passed"
}

# ============================================================================
# SYSTEM UPDATE
# ============================================================================
update_system() {
    step_start "Updating system packages"
    
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
    
    # Restart necessary services
    systemctl restart dbus.service || true
    systemctl restart networkd-dispatcher.service || true
    systemctl restart systemd-logind.service || true
    systemctl restart unattended-upgrades.service || true
    
    log_success "System updated successfully"
}

# ============================================================================
# CREATE FRAPPE USER
# ============================================================================
create_frappe_user() {
    step_start "Creating frappe user: $FRAPPE_USER"
    
    if id "$FRAPPE_USER" &>/dev/null; then
        log_info "User $FRAPPE_USER already exists"
    else
        useradd -m -s /bin/bash "$FRAPPE_USER"
        echo "$FRAPPE_USER:$FRAPPE_USER_PASSWORD" | chpasswd
        usermod -aG sudo "$FRAPPE_USER"
        
        # Allow sudo without password for frappe user (for automation)
        echo "$FRAPPE_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$FRAPPE_USER
        chmod 0440 /etc/sudoers.d/$FRAPPE_USER
        
        log_success "User $FRAPPE_USER created successfully"
    fi
}

# ============================================================================
# INSTALL DEPENDENCIES
# ============================================================================
install_dependencies() {
    step_start "Installing system dependencies"
    
    # Essential packages
    apt-get install -y \
        git \
        curl \
        wget \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    # Python packages
    apt-get install -y \
        python3-dev \
        python3-setuptools \
        python3-pip \
        python3-distutils \
        python3-venv \
        python3.10-dev \
        python3.10-venv
    
    # Build essentials
    apt-get install -y \
        build-essential \
        libffi-dev \
        libssl-dev \
        libjpeg-dev \
        zlib1g-dev \
        libfreetype6-dev
    
    # MariaDB client libraries
    apt-get install -y \
        libmysqlclient-dev \
        libmariadb-dev
    
    # wkhtmltopdf for PDF generation
    apt-get install -y \
        xvfb \
        libfontconfig \
        wkhtmltopdf
    
    # Redis
    apt-get install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
    
    # Nginx
    apt-get install -y nginx
    systemctl enable nginx
    
    # Supervisor
    apt-get install -y supervisor
    systemctl enable supervisor
    
    # Certbot for SSL
    apt-get install -y certbot python3-certbot-nginx
    
    log_success "Dependencies installed successfully"
}

# ============================================================================
# INSTALL MARIADB
# ============================================================================
install_mariadb() {
    step_start "Installing and configuring MariaDB"
    
    # Install MariaDB
    apt-get install -y mariadb-server mariadb-client
    
    # Start MariaDB
    systemctl enable mariadb
    systemctl start mariadb
    
    # Secure MariaDB installation
    mysql --user=root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('$MARIADB_ROOT_PASSWORD');
FLUSH PRIVILEGES;
DELETE FROM mysql.user WHERE User='';
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF
    
    # Configure MariaDB for Frappe
    cat > /etc/mysql/mariadb.conf.d/99-frappe.cnf <<EOF
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT

[mysql]
default-character-set = utf8mb4
EOF
    
    # Restart MariaDB
    systemctl restart mariadb
    
    log_success "MariaDB installed and configured"
}

# ============================================================================
# INSTALL NODE.JS
# ============================================================================
install_nodejs() {
    step_start "Installing Node.js v$NODE_VERSION"
    
    # Install NVM for frappe user
    sudo -u "$FRAPPE_USER" bash <<EOF
cd /home/$FRAPPE_USER
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
nvm install $NODE_VERSION
nvm use $NODE_VERSION
nvm alias default $NODE_VERSION
npm install -g yarn
EOF
    
    log_success "Node.js installed successfully"
}

# ============================================================================
# INSTALL FRAPPE BENCH
# ============================================================================
install_bench() {
    step_start "Installing Frappe Bench CLI"
    
    pip3 install frappe-bench
    
    log_success "Frappe Bench CLI installed"
}

# ============================================================================
# INITIALIZE FRAPPE BENCH
# ============================================================================
initialize_bench() {
    step_start "Initializing Frappe Bench"
    
    sudo -u "$FRAPPE_USER" bash <<EOF
cd /home/$FRAPPE_USER
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Initialize bench
bench init --frappe-branch $FRAPPE_BRANCH $BENCH_NAME

cd $BENCH_NAME

# Set proper permissions
chmod -R o+rx /home/$FRAPPE_USER
EOF
    
    log_success "Frappe Bench initialized"
}

# ============================================================================
# INSTALL FRAPPE APPS
# ============================================================================
install_apps() {
    step_start "Installing Frappe Apps"
    
    sudo -u "$FRAPPE_USER" bash <<EOF
cd /home/$FRAPPE_USER/$BENCH_NAME
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Install standard apps
for app in $APPS_TO_INSTALL; do
    echo "Installing app: \$app"
    case \$app in
        erpnext)
            bench get-app --branch $FRAPPE_BRANCH erpnext
            ;;
        hrms)
            bench get-app hrms --branch $FRAPPE_BRANCH https://github.com/frappe/hrms.git
            ;;
        payments)
            bench get-app payments --branch $FRAPPE_BRANCH https://github.com/frappe/payments.git
            ;;
        webshop)
            bench get-app webshop --branch $FRAPPE_BRANCH https://github.com/frappe/webshop.git
            ;;
        india_compliance)
            bench get-app india-compliance --branch $FRAPPE_BRANCH https://github.com/resilient-tech/india-compliance.git
            ;;
        healthcare)
            bench get-app healthcare --branch $FRAPPE_BRANCH https://github.com/frappe/healthcare.git
            ;;
        education)
            bench get-app education --branch $FRAPPE_BRANCH https://github.com/frappe/education.git
            ;;
        lending)
            bench get-app lending --branch $FRAPPE_BRANCH https://github.com/frappe/lending.git
            ;;
        hospitality)
            bench get-app hospitality --branch $FRAPPE_BRANCH https://github.com/frappe/hospitality.git
            ;;
        agriculture)
            bench get-app agriculture --branch $FRAPPE_BRANCH https://github.com/frappe/agriculture.git
            ;;
        non_profit)
            bench get-app non_profit --branch $FRAPPE_BRANCH https://github.com/frappe/non_profit.git
            ;;
        crm)
            bench get-app crm --branch $FRAPPE_BRANCH https://github.com/frappe/crm.git
            ;;
        wiki)
            bench get-app wiki --branch $FRAPPE_BRANCH https://github.com/frappe/wiki.git
            ;;
        print_designer)
            bench get-app print_designer --branch $FRAPPE_BRANCH https://github.com/frappe/print_designer.git
            ;;
        insights)
            bench get-app insights --branch $FRAPPE_BRANCH https://github.com/frappe/insights.git
            ;;
        builder)
            bench get-app builder --branch $FRAPPE_BRANCH https://github.com/frappe/builder.git
            ;;
        drive)
            bench get-app drive --branch $FRAPPE_BRANCH https://github.com/frappe/drive.git
            ;;
        helpdesk)
            bench get-app helpdesk --branch $FRAPPE_BRANCH https://github.com/frappe/helpdesk.git
            ;;
        gameplan)
            bench get-app gameplan --branch $FRAPPE_BRANCH https://github.com/frappe/gameplan.git
            ;;
        lms)
            bench get-app lms --branch $FRAPPE_BRANCH https://github.com/frappe/lms.git
            ;;
        *)
            echo "Unknown standard app: \$app - trying direct get-app..."
            bench get-app \$app --branch $FRAPPE_BRANCH || echo "Failed to install \$app"
            ;;
    esac
done

# Install custom apps
IFS=' ' read -ra CUSTOM_APP_LIST <<< "$CUSTOM_APPS"
for custom_app in "\${CUSTOM_APP_LIST[@]}"; do
    if [ -n "\$custom_app" ]; then
        IFS='|' read -r app_name app_branch app_repo <<< "\$custom_app"
        echo "Installing custom app: \$app_name from \$app_repo (branch: \$app_branch)"
        bench get-app \$app_name --branch \$app_branch \$app_repo
    fi
done
EOF
    
    log_success "All apps installed"
}

# ============================================================================
# SETUP PRODUCTION
# ============================================================================
setup_production() {
    step_start "Setting up production environment"
    
    cd /home/$FRAPPE_USER/$BENCH_NAME
    
    # Setup supervisor and nginx
    bench setup supervisor --yes
    bench setup nginx --yes
    
    # Link configs
    ln -sf /home/$FRAPPE_USER/$BENCH_NAME/config/supervisor.conf /etc/supervisor/conf.d/frappe-bench.conf
    ln -sf /home/$FRAPPE_USER/$BENCH_NAME/config/nginx.conf /etc/nginx/conf.d/frappe-bench.conf
    
    # Remove default nginx site
    rm -f /etc/nginx/sites-enabled/default
    
    # Reload services
    supervisorctl reread
    supervisorctl update
    systemctl reload nginx
    
    log_success "Production environment configured"
}

# ============================================================================
# CREATE CREDENTIALS FILE
# ============================================================================
save_credentials() {
    step_start "Saving credentials"
    
    local creds_file="/home/$FRAPPE_USER/server-credentials.txt"
    
    cat > "$creds_file" <<EOF
============================================
ERPNext Server Credentials
Generated: $(date)
============================================

FRAPPE USER
-----------
Username: $FRAPPE_USER
Password: $FRAPPE_USER_PASSWORD

MARIADB
-------
Root Password: $MARIADB_ROOT_PASSWORD

BENCH LOCATION
--------------
Path: /home/$FRAPPE_USER/$BENCH_NAME

INSTALLED APPS
--------------
$APPS_TO_INSTALL
$CUSTOM_APPS

IMPORTANT
---------
- Store these credentials securely
- Delete this file after saving credentials
- Use 'bench new-site' to create new sites

============================================
EOF
    
    chown $FRAPPE_USER:$FRAPPE_USER "$creds_file"
    chmod 600 "$creds_file"
    
    log_success "Credentials saved to $creds_file"
}

# ============================================================================
# OUTPUT JSON (for dashboard integration)
# ============================================================================
output_json() {
    local json_file="/home/$FRAPPE_USER/setup-result.json"
    
    cat > "$json_file" <<EOF
{
    "status": "success",
    "timestamp": "$(date -Iseconds)",
    "frappe_user": "$FRAPPE_USER",
    "frappe_user_password": "$FRAPPE_USER_PASSWORD",
    "mariadb_root_password": "$MARIADB_ROOT_PASSWORD",
    "bench_path": "/home/$FRAPPE_USER/$BENCH_NAME",
    "frappe_branch": "$FRAPPE_BRANCH",
    "node_version": "$NODE_VERSION",
    "installed_apps": "$APPS_TO_INSTALL",
    "custom_apps": "$CUSTOM_APPS",
    "log_file": "$LOG_FILE"
}
EOF
    
    chown $FRAPPE_USER:$FRAPPE_USER "$json_file"
    chmod 600 "$json_file"
    
    echo ""
    echo "=============================================="
    echo "SETUP RESULT JSON"
    echo "=============================================="
    cat "$json_file"
}

# ============================================================================
# CLEANUP
# ============================================================================
cleanup() {
    step_start "Cleaning up"
    
    apt-get autoremove -y
    apt-get clean
    
    log_success "Cleanup completed"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║     ERPNext Multi-Tenant Server Setup Script v2.0            ║"
    echo "║     Non-Interactive / Automated Installation                  ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    local start_time=$(date +%s)
    
    preflight_checks
    update_system
    create_frappe_user
    install_dependencies
    install_mariadb
    install_nodejs
    install_bench
    initialize_bench
    install_apps
    setup_production
    save_credentials
    cleanup
    output_json
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    SETUP COMPLETE!                            ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║  Duration: ${minutes}m ${seconds}s                                          "
    echo "║  Log file: $LOG_FILE                                          "
    echo "║  Credentials: /home/$FRAPPE_USER/server-credentials.txt       "
    echo "║                                                               ║"
    echo "║  Next steps:                                                  ║"
    echo "║  1. Save credentials securely                                 ║"
    echo "║  2. Create your first site:                                   ║"
    echo "║     bench new-site yoursite.com                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
}

# Run main function
main "$@"
