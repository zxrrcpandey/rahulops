-- ============================================================================
-- ERPNext Deployer - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SERVERS - Your Hostinger VPS Servers
-- ============================================================================
CREATE TABLE IF NOT EXISTS servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    ssh_user VARCHAR(50) DEFAULT 'frappe',
    ssh_port INTEGER DEFAULT 22,
    ssh_private_key TEXT,
    bench_path VARCHAR(255) DEFAULT '/home/frappe/frappe-bench',
    frappe_user VARCHAR(50) DEFAULT 'frappe',
    mariadb_root_password TEXT,
    
    -- Resource tracking
    total_ram_gb INTEGER,
    total_cpu_cores INTEGER,
    total_disk_gb INTEGER,
    max_sites INTEGER DEFAULT 10,
    
    -- Installed apps on this server's bench
    installed_apps JSONB DEFAULT '["frappe", "erpnext"]'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'setup_running', 'active', 'maintenance', 'offline')),
    setup_completed_at TIMESTAMPTZ,
    last_health_check TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CLIENTS - Your Customers
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(20),
    notes TEXT,
    
    -- Billing
    plan VARCHAR(50),
    billing_cycle VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SITES - ERPNext Sites (Multi-Tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    server_id UUID REFERENCES servers(id) ON DELETE RESTRICT NOT NULL,
    
    -- Site details
    site_name VARCHAR(255) NOT NULL UNIQUE,
    domain_type VARCHAR(20) DEFAULT 'subdomain' CHECK (domain_type IN ('custom', 'subdomain')),
    
    -- Apps installed on this site
    apps JSONB DEFAULT '["erpnext"]'::jsonb,
    
    -- Credentials (store encrypted)
    admin_password TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'active', 'suspended', 'failed', 'deleted')),
    ssl_enabled BOOLEAN DEFAULT false,
    scheduler_enabled BOOLEAN DEFAULT true,
    
    -- Deployment tracking
    deployment_started_at TIMESTAMPTZ,
    deployment_completed_at TIMESTAMPTZ,
    deployment_log TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DNS RECORDS - Track DNS configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS dns_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    
    record_type VARCHAR(10) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    
    -- Cloudflare integration
    cloudflare_record_id VARCHAR(100),
    cloudflare_zone_id VARCHAR(100),
    
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BACKUPS - Backup Management
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    server_id UUID REFERENCES servers(id),
    
    backup_type VARCHAR(20) DEFAULT 'full' CHECK (backup_type IN ('full', 'database', 'files')),
    trigger_type VARCHAR(20) DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'scheduled')),
    
    -- File information
    file_path VARCHAR(500),
    file_size_mb DECIMAL(10,2),
    
    -- Remote storage
    remote_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BACKUP SCHEDULES - Automated Backups
-- ============================================================================
CREATE TABLE IF NOT EXISTS backup_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    time_utc TIME DEFAULT '02:00:00',
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
    
    backup_type VARCHAR(20) DEFAULT 'full',
    retention_days INTEGER DEFAULT 30,
    
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEPLOYMENT JOBS - Track Deployments
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployment_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    server_id UUID REFERENCES servers(id),
    
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('site_creation', 'app_install', 'ssl_setup', 'server_setup', 'backup', 'restore')),
    
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    current_step VARCHAR(100),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    logs TEXT,
    error_message TEXT,
    
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEAM MEMBERS - Dashboard Users
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG - Audit Trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID REFERENCES team_members(id),
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    details JSONB,
    ip_address VARCHAR(45),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SETTINGS - Global Settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    encrypted BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial settings
INSERT INTO settings (key, value, encrypted) VALUES
    ('your_domain', '', false),
    ('cloudflare_api_token', '', true),
    ('cloudflare_zone_id', '', false),
    ('smtp_host', '', false),
    ('smtp_port', '587', false),
    ('smtp_user', '', false),
    ('smtp_password', '', true),
    ('notification_email', '', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (team members)
CREATE POLICY "Team members can view servers" ON servers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage servers" ON servers
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view clients" ON clients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage clients" ON clients
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view sites" ON sites
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage sites" ON sites
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view dns_records" ON dns_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage dns_records" ON dns_records
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view backups" ON backups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage backups" ON backups
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view backup_schedules" ON backup_schedules
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage backup_schedules" ON backup_schedules
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view deployment_jobs" ON deployment_jobs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can manage deployment_jobs" ON deployment_jobs
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Team members can view team_members" ON team_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage team_members" ON team_members
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.auth_user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

CREATE POLICY "Team members can view activity_log" ON activity_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can insert activity_log" ON activity_log
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Team members can view settings" ON settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.auth_user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get server statistics
CREATE OR REPLACE FUNCTION get_server_stats(server_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_sites', COUNT(*),
        'active_sites', COUNT(*) FILTER (WHERE status = 'active'),
        'suspended_sites', COUNT(*) FILTER (WHERE status = 'suspended'),
        'pending_sites', COUNT(*) FILTER (WHERE status = 'pending')
    ) INTO result
    FROM sites
    WHERE server_id = server_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_servers', (SELECT COUNT(*) FROM servers),
        'active_servers', (SELECT COUNT(*) FROM servers WHERE status = 'active'),
        'total_clients', (SELECT COUNT(*) FROM clients),
        'total_sites', (SELECT COUNT(*) FROM sites),
        'active_sites', (SELECT COUNT(*) FROM sites WHERE status = 'active'),
        'pending_deployments', (SELECT COUNT(*) FROM deployment_jobs WHERE status IN ('queued', 'running'))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sites_server_id ON sites(server_id);
CREATE INDEX IF NOT EXISTS idx_sites_client_id ON sites(client_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_backups_site_id ON backups(site_id);
CREATE INDEX IF NOT EXISTS idx_deployment_jobs_site_id ON deployment_jobs(site_id);
CREATE INDEX IF NOT EXISTS idx_deployment_jobs_status ON deployment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
