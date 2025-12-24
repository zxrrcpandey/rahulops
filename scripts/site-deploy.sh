#!/bin/bash
# ============================================================================
# ERPNext Site Deployment Script
# Version: 2.0
# Description: Non-interactive script to create a new site on an existing
#              Frappe Bench installation (multi-tenant)
# ============================================================================

set -e  # Exit on any error

# ============================================================================
# CONFIGURATION - Pass these as environment variables
# ============================================================================
SITE_NAME="${SITE_NAME:-}"                      # Required: erp.client.com
ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 16)}"
MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD:-}"  # Required
FRAPPE_USER="${FRAPPE_USER:-frappe}"
BENCH_PATH="${BENCH_PATH:-/home/frappe/frappe-bench}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"

# Apps to install on this site (space-separated)
# Example: "erpnext hrms payments india_compliance Trustbit"
SITE_APPS="${SITE_APPS:-erpnext}"

# SSL Configuration
SETUP_SSL="${SETUP_SSL:-true}"
SSL_EMAIL="${SSL_EMAIL:-admin@example.com}"

# DNS Configuration
DNS_TYPE="${DNS_TYPE:-custom}"                  # 'custom' or 'subdomain'
YOUR_DOMAIN="${YOUR_DOMAIN:-}"                  # For subdomain: yourdomain.com

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================
LOG_FILE="/tmp/site-deploy-$(date +%Y%m%d-%H%M%S).log"

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

output_progress() {
    local step="$1"
    local progress="$2"
    local message="$3"
    
    # Output JSON progress for dashboard integration
    echo "{\"step\": \"$step\", \"progress\": $progress, \"message\": \"$message\"}" >> /tmp/deployment-progress.json
}

# ============================================================================
# VALIDATION
# ============================================================================
validate_inputs() {
    step_start "Validating inputs"
    
    if [ -z "$SITE_NAME" ]; then
        log_error "SITE_NAME is required"
        exit 1
    fi
    
    if [ -z "$MARIADB_ROOT_PASSWORD" ]; then
        log_error "MARIADB_ROOT_PASSWORD is required"
        exit 1
    fi
    
    if [ ! -d "$BENCH_PATH" ]; then
        log_error "Bench path not found: $BENCH_PATH"
        exit 1
    fi
    
    # Check if site already exists
    if [ -d "$BENCH_PATH/sites/$SITE_NAME" ]; then
        log_error "Site already exists: $SITE_NAME"
        exit 1
    fi
    
    log_success "Inputs validated"
    output_progress "validation" 5 "Inputs validated"
}

# ============================================================================
# CREATE NEW SITE
# ============================================================================
create_site() {
    step_start "Creating new site: $SITE_NAME"
    output_progress "create_site" 10 "Creating new site"
    
    cd "$BENCH_PATH"
    
    # Create the site
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

bench new-site "$SITE_NAME" \
    --admin-password "$ADMIN_PASSWORD" \
    --mariadb-root-password "$MARIADB_ROOT_PASSWORD" \
    --no-mariadb-socket
EOF
    
    log_success "Site created: $SITE_NAME"
    output_progress "create_site" 25 "Site created successfully"
}

# ============================================================================
# INSTALL APPS ON SITE
# ============================================================================
install_site_apps() {
    step_start "Installing apps on site"
    output_progress "install_apps" 30 "Installing apps"
    
    local progress=30
    local progress_step=$((40 / $(echo $SITE_APPS | wc -w)))
    
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

for app in $SITE_APPS; do
    echo "Installing app: \$app"
    
    # Check if app exists in bench
    if [ -d "apps/\$app" ] || [ -d "apps/\${app//_/-}" ]; then
        # Handle india_compliance -> india-compliance naming
        app_name=\$app
        if [ "\$app" = "india_compliance" ]; then
            app_name="india_compliance"
        fi
        
        bench --site "$SITE_NAME" install-app \$app_name || echo "Failed to install \$app"
    else
        echo "App \$app not found in bench, skipping..."
    fi
done
EOF
    
    log_success "Apps installed"
    output_progress "install_apps" 70 "Apps installed successfully"
}

# ============================================================================
# CONFIGURE SITE
# ============================================================================
configure_site() {
    step_start "Configuring site"
    output_progress "configure" 72 "Configuring site"
    
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

# Enable scheduler
bench --site "$SITE_NAME" enable-scheduler

# Turn off maintenance mode
bench --site "$SITE_NAME" set-maintenance-mode off

# Set site config
bench --site "$SITE_NAME" set-config developer_mode 0
bench --site "$SITE_NAME" set-config disable_website_cache 0
EOF
    
    log_success "Site configured"
    output_progress "configure" 75 "Site configured"
}

# ============================================================================
# SETUP NGINX
# ============================================================================
setup_nginx() {
    step_start "Setting up Nginx"
    output_progress "nginx" 78 "Configuring Nginx"
    
    cd "$BENCH_PATH"
    
    # Regenerate nginx config
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

bench setup nginx --yes
EOF
    
    # Reload nginx
    sudo systemctl reload nginx
    
    log_success "Nginx configured"
    output_progress "nginx" 85 "Nginx configured"
}

# ============================================================================
# SETUP SSL
# ============================================================================
setup_ssl() {
    if [ "$SETUP_SSL" != "true" ]; then
        log_info "Skipping SSL setup (SETUP_SSL is not true)"
        output_progress "ssl" 95 "SSL setup skipped"
        return
    fi
    
    step_start "Setting up SSL certificate"
    output_progress "ssl" 88 "Setting up SSL"
    
    # Check if domain resolves to this server
    local server_ip=$(curl -s ifconfig.me)
    local domain_ip=$(dig +short "$SITE_NAME" | tail -n1)
    
    if [ "$server_ip" != "$domain_ip" ]; then
        log_warning "Domain $SITE_NAME does not resolve to this server yet."
        log_warning "Server IP: $server_ip, Domain IP: $domain_ip"
        log_warning "SSL setup skipped. Run manually after DNS propagation:"
        log_warning "sudo certbot --nginx -d $SITE_NAME"
        output_progress "ssl" 95 "SSL skipped - DNS not propagated"
        return
    fi
    
    # Request SSL certificate
    sudo certbot --nginx \
        --non-interactive \
        --agree-tos \
        --email "$SSL_EMAIL" \
        -d "$SITE_NAME" || {
            log_warning "SSL setup failed. Run manually: sudo certbot --nginx -d $SITE_NAME"
            output_progress "ssl" 95 "SSL setup failed - run manually"
            return
        }
    
    log_success "SSL certificate installed"
    output_progress "ssl" 95 "SSL certificate installed"
}

# ============================================================================
# RESTART SERVICES
# ============================================================================
restart_services() {
    step_start "Restarting services"
    output_progress "restart" 96 "Restarting services"
    
    sudo supervisorctl restart all
    
    log_success "Services restarted"
    output_progress "restart" 98 "Services restarted"
}

# ============================================================================
# OUTPUT RESULT
# ============================================================================
output_result() {
    step_start "Deployment complete"
    output_progress "complete" 100 "Deployment complete"
    
    local result_file="/tmp/site-result-$SITE_NAME.json"
    
    # Determine final URL
    local site_url="http://$SITE_NAME"
    if [ "$SETUP_SSL" = "true" ]; then
        # Check if SSL was successful
        if sudo certbot certificates 2>/dev/null | grep -q "$SITE_NAME"; then
            site_url="https://$SITE_NAME"
        fi
    fi
    
    cat > "$result_file" <<EOF
{
    "status": "success",
    "timestamp": "$(date -Iseconds)",
    "site_name": "$SITE_NAME",
    "site_url": "$site_url",
    "admin_user": "Administrator",
    "admin_password": "$ADMIN_PASSWORD",
    "admin_email": "$ADMIN_EMAIL",
    "installed_apps": "$SITE_APPS",
    "ssl_enabled": $([ "$SETUP_SSL" = "true" ] && echo "true" || echo "false"),
    "bench_path": "$BENCH_PATH",
    "log_file": "$LOG_FILE"
}
EOF
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║               SITE DEPLOYMENT COMPLETE!                       ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║                                                               ║"
    echo "   Site URL:     $site_url"
    echo "   Admin User:   Administrator"
    echo "   Admin Password: $ADMIN_PASSWORD"
    echo "   Apps:         $SITE_APPS"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    
    echo ""
    echo "RESULT JSON:"
    cat "$result_file"
}

# ============================================================================
# CLEANUP ON ERROR
# ============================================================================
cleanup_on_error() {
    log_error "Deployment failed! Cleaning up..."
    
    # Remove partially created site
    if [ -d "$BENCH_PATH/sites/$SITE_NAME" ]; then
        log_info "Removing partial site directory..."
        sudo rm -rf "$BENCH_PATH/sites/$SITE_NAME"
    fi
    
    # Try to drop database if created
    mysql -u root -p"$MARIADB_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS \`${SITE_NAME//\./_}\`;" 2>/dev/null || true
    
    # Output error result
    cat > "/tmp/site-result-$SITE_NAME.json" <<EOF
{
    "status": "failed",
    "timestamp": "$(date -Iseconds)",
    "site_name": "$SITE_NAME",
    "error": "Deployment failed - check logs",
    "log_file": "$LOG_FILE"
}
EOF
    
    echo "RESULT JSON:"
    cat "/tmp/site-result-$SITE_NAME.json"
    
    exit 1
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║         ERPNext Site Deployment Script v2.0                  ║"
    echo "║         Multi-Tenant Site Creation                            ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Set trap for cleanup on error
    trap cleanup_on_error ERR
    
    local start_time=$(date +%s)
    
    # Clear progress file
    echo "" > /tmp/deployment-progress.json
    
    validate_inputs
    create_site
    install_site_apps
    configure_site
    setup_nginx
    setup_ssl
    restart_services
    output_result
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    log_success "Total deployment time: ${minutes}m ${seconds}s"
}

# Run main function
main "$@"
