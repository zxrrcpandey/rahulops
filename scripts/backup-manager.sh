#!/bin/bash
# ============================================================================
# ERPNext Site Backup Script
# Version: 2.0
# Description: Backup and restore ERPNext sites
# ============================================================================

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================
FRAPPE_USER="${FRAPPE_USER:-frappe}"
BENCH_PATH="${BENCH_PATH:-/home/frappe/frappe-bench}"
BACKUP_DIR="${BACKUP_DIR:-/home/frappe/backups}"
SITE_NAME="${SITE_NAME:-}"
ACTION="${ACTION:-backup}"  # backup, restore, list, delete

# Remote storage (optional)
REMOTE_STORAGE="${REMOTE_STORAGE:-}"  # s3, gcs, local
S3_BUCKET="${S3_BUCKET:-}"
S3_REGION="${S3_REGION:-}"

# Restore options
RESTORE_FILE="${RESTORE_FILE:-}"

# Retention
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# ============================================================================
# LOGGING
# ============================================================================
log() {
    local level="$1"
    local message="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message"
}

log_info() { log "INFO" "$1"; }
log_success() { log "SUCCESS" "$1"; }
log_error() { log "ERROR" "$1"; }

# ============================================================================
# BACKUP FUNCTIONS
# ============================================================================
create_backup() {
    local site="$1"
    
    log_info "Creating backup for site: $site"
    
    # Create backup directory
    local date_str=$(date +%Y%m%d-%H%M%S)
    local backup_subdir="$BACKUP_DIR/$site/$date_str"
    mkdir -p "$backup_subdir"
    
    cd "$BENCH_PATH"
    
    # Run bench backup
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

bench --site "$site" backup --with-files
EOF
    
    # Move backup files to backup directory
    local latest_backup_dir="$BENCH_PATH/sites/$site/private/backups"
    
    # Find the latest backup files
    local latest_db=$(ls -t "$latest_backup_dir"/*-database.sql.gz 2>/dev/null | head -1)
    local latest_files=$(ls -t "$latest_backup_dir"/*-files.tar 2>/dev/null | head -1)
    local latest_private=$(ls -t "$latest_backup_dir"/*-private-files.tar 2>/dev/null | head -1)
    
    if [ -n "$latest_db" ]; then
        cp "$latest_db" "$backup_subdir/"
        log_info "Database backup: $(basename $latest_db)"
    fi
    
    if [ -n "$latest_files" ]; then
        cp "$latest_files" "$backup_subdir/"
        log_info "Files backup: $(basename $latest_files)"
    fi
    
    if [ -n "$latest_private" ]; then
        cp "$latest_private" "$backup_subdir/"
        log_info "Private files backup: $(basename $latest_private)"
    fi
    
    # Create backup info file
    local backup_size=$(du -sh "$backup_subdir" | cut -f1)
    cat > "$backup_subdir/backup-info.json" <<EOF
{
    "site": "$site",
    "timestamp": "$(date -Iseconds)",
    "date_string": "$date_str",
    "size": "$backup_size",
    "database": "$(basename "$latest_db" 2>/dev/null || echo "none")",
    "files": "$(basename "$latest_files" 2>/dev/null || echo "none")",
    "private_files": "$(basename "$latest_private" 2>/dev/null || echo "none")",
    "bench_path": "$BENCH_PATH"
}
EOF
    
    # Upload to remote storage if configured
    if [ -n "$REMOTE_STORAGE" ]; then
        upload_to_remote "$backup_subdir" "$site" "$date_str"
    fi
    
    log_success "Backup completed: $backup_subdir"
    log_success "Backup size: $backup_size"
    
    # Output result JSON
    echo ""
    echo "RESULT:"
    cat "$backup_subdir/backup-info.json"
}

backup_all_sites() {
    log_info "Backing up all sites on this server"
    
    cd "$BENCH_PATH/sites"
    
    for site_dir in */; do
        site="${site_dir%/}"
        
        # Skip assets and common directories
        if [ "$site" = "assets" ] || [ "$site" = "common_site_config.json" ]; then
            continue
        fi
        
        # Check if it's a valid site
        if [ -f "$site/site_config.json" ]; then
            create_backup "$site"
        fi
    done
}

# ============================================================================
# RESTORE FUNCTIONS
# ============================================================================
restore_backup() {
    local site="$1"
    local backup_path="$2"
    
    if [ -z "$backup_path" ]; then
        log_error "RESTORE_FILE or backup path is required"
        exit 1
    fi
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup path not found: $backup_path"
        exit 1
    fi
    
    log_info "Restoring site: $site from $backup_path"
    
    # Find backup files
    local db_file=$(ls "$backup_path"/*-database.sql.gz 2>/dev/null | head -1)
    local files_tar=$(ls "$backup_path"/*-files.tar 2>/dev/null | head -1)
    local private_tar=$(ls "$backup_path"/*-private-files.tar 2>/dev/null | head -1)
    
    if [ -z "$db_file" ]; then
        log_error "Database backup not found in $backup_path"
        exit 1
    fi
    
    cd "$BENCH_PATH"
    
    # Put site in maintenance mode
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

bench --site "$site" set-maintenance-mode on
EOF
    
    # Restore database
    log_info "Restoring database..."
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

bench --site "$site" restore "$db_file"
EOF
    
    # Restore files if available
    if [ -n "$files_tar" ]; then
        log_info "Restoring public files..."
        tar -xf "$files_tar" -C "$BENCH_PATH/sites/$site/public/"
    fi
    
    if [ -n "$private_tar" ]; then
        log_info "Restoring private files..."
        tar -xf "$private_tar" -C "$BENCH_PATH/sites/$site/private/"
    fi
    
    # Run migrations and clear cache
    sudo -u "$FRAPPE_USER" bash <<EOF
cd $BENCH_PATH
export NVM_DIR="/home/$FRAPPE_USER/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"

bench --site "$site" migrate
bench --site "$site" clear-cache
bench --site "$site" set-maintenance-mode off
EOF
    
    log_success "Restore completed for site: $site"
}

# ============================================================================
# LIST BACKUPS
# ============================================================================
list_backups() {
    local site="$1"
    
    if [ -n "$site" ]; then
        local site_backup_dir="$BACKUP_DIR/$site"
        if [ ! -d "$site_backup_dir" ]; then
            log_info "No backups found for site: $site"
            echo "[]"
            return
        fi
        
        echo "["
        local first=true
        for backup_dir in "$site_backup_dir"/*/; do
            if [ -f "$backup_dir/backup-info.json" ]; then
                if [ "$first" = true ]; then
                    first=false
                else
                    echo ","
                fi
                cat "$backup_dir/backup-info.json"
            fi
        done
        echo "]"
    else
        # List all backups
        echo "{"
        local first_site=true
        for site_dir in "$BACKUP_DIR"/*/; do
            site_name=$(basename "$site_dir")
            if [ "$first_site" = true ]; then
                first_site=false
            else
                echo ","
            fi
            echo "\"$site_name\": ["
            local first=true
            for backup_dir in "$site_dir"/*/; do
                if [ -f "$backup_dir/backup-info.json" ]; then
                    if [ "$first" = true ]; then
                        first=false
                    else
                        echo ","
                    fi
                    cat "$backup_dir/backup-info.json"
                fi
            done
            echo "]"
        done
        echo "}"
    fi
}

# ============================================================================
# DELETE OLD BACKUPS
# ============================================================================
delete_old_backups() {
    local site="$1"
    local days="${2:-$RETENTION_DAYS}"
    
    log_info "Deleting backups older than $days days"
    
    local search_dir="$BACKUP_DIR"
    if [ -n "$site" ]; then
        search_dir="$BACKUP_DIR/$site"
    fi
    
    if [ ! -d "$search_dir" ]; then
        log_info "No backup directory found: $search_dir"
        return
    fi
    
    # Find and delete old backup directories
    local deleted_count=0
    local deleted_size=0
    
    while IFS= read -r -d '' backup_dir; do
        local dir_size=$(du -s "$backup_dir" | cut -f1)
        deleted_size=$((deleted_size + dir_size))
        deleted_count=$((deleted_count + 1))
        
        log_info "Deleting: $backup_dir"
        rm -rf "$backup_dir"
    done < <(find "$search_dir" -maxdepth 2 -type d -mtime +$days -print0 2>/dev/null)
    
    log_success "Deleted $deleted_count backup(s), freed $(numfmt --to=iec $((deleted_size * 1024))) space"
}

# ============================================================================
# UPLOAD TO REMOTE STORAGE
# ============================================================================
upload_to_remote() {
    local backup_dir="$1"
    local site="$2"
    local date_str="$3"
    
    case "$REMOTE_STORAGE" in
        s3)
            if [ -z "$S3_BUCKET" ]; then
                log_error "S3_BUCKET is required for S3 storage"
                return 1
            fi
            
            log_info "Uploading to S3: s3://$S3_BUCKET/$site/$date_str/"
            aws s3 sync "$backup_dir" "s3://$S3_BUCKET/$site/$date_str/" --region "$S3_REGION"
            ;;
        gcs)
            log_info "Uploading to GCS..."
            # gsutil implementation
            ;;
        *)
            log_warning "Unknown remote storage: $REMOTE_STORAGE"
            ;;
    esac
}

# ============================================================================
# DOWNLOAD FROM REMOTE
# ============================================================================
download_from_remote() {
    local remote_path="$1"
    local local_path="$2"
    
    case "$REMOTE_STORAGE" in
        s3)
            log_info "Downloading from S3: $remote_path"
            aws s3 sync "$remote_path" "$local_path" --region "$S3_REGION"
            ;;
        *)
            log_warning "Unknown remote storage: $REMOTE_STORAGE"
            ;;
    esac
}

# ============================================================================
# MAIN
# ============================================================================
main() {
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    case "$ACTION" in
        backup)
            if [ -n "$SITE_NAME" ]; then
                create_backup "$SITE_NAME"
            else
                backup_all_sites
            fi
            ;;
        restore)
            if [ -z "$SITE_NAME" ]; then
                log_error "SITE_NAME is required for restore"
                exit 1
            fi
            restore_backup "$SITE_NAME" "$RESTORE_FILE"
            ;;
        list)
            list_backups "$SITE_NAME"
            ;;
        delete-old)
            delete_old_backups "$SITE_NAME" "$RETENTION_DAYS"
            ;;
        *)
            echo "Usage: $0"
            echo "  ACTION=backup SITE_NAME=site.com         - Backup specific site"
            echo "  ACTION=backup                            - Backup all sites"
            echo "  ACTION=restore SITE_NAME=site.com RESTORE_FILE=/path/to/backup"
            echo "  ACTION=list [SITE_NAME=site.com]         - List backups"
            echo "  ACTION=delete-old [RETENTION_DAYS=30]    - Delete old backups"
            exit 1
            ;;
    esac
}

main "$@"
