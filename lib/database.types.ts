// Auto-generated types for Supabase - Update using: npm run db:generate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      servers: {
        Row: {
          id: string
          name: string
          location: string | null
          ip_address: string
          ssh_user: string
          ssh_port: number
          ssh_private_key: string | null
          bench_path: string
          frappe_user: string
          mariadb_root_password: string | null
          total_ram_gb: number | null
          total_cpu_cores: number | null
          total_disk_gb: number | null
          max_sites: number
          installed_apps: Json
          status: 'pending' | 'setup_running' | 'active' | 'maintenance' | 'offline'
          setup_completed_at: string | null
          last_health_check: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          ip_address: string
          ssh_user?: string
          ssh_port?: number
          ssh_private_key?: string | null
          bench_path?: string
          frappe_user?: string
          mariadb_root_password?: string | null
          total_ram_gb?: number | null
          total_cpu_cores?: number | null
          total_disk_gb?: number | null
          max_sites?: number
          installed_apps?: Json
          status?: 'pending' | 'setup_running' | 'active' | 'maintenance' | 'offline'
          setup_completed_at?: string | null
          last_health_check?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          ip_address?: string
          ssh_user?: string
          ssh_port?: number
          ssh_private_key?: string | null
          bench_path?: string
          frappe_user?: string
          mariadb_root_password?: string | null
          total_ram_gb?: number | null
          total_cpu_cores?: number | null
          total_disk_gb?: number | null
          max_sites?: number
          installed_apps?: Json
          status?: 'pending' | 'setup_running' | 'active' | 'maintenance' | 'offline'
          setup_completed_at?: string | null
          last_health_check?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          company: string | null
          email: string | null
          phone: string | null
          address: string | null
          gst_number: string | null
          notes: string | null
          plan: string | null
          billing_cycle: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          gst_number?: string | null
          notes?: string | null
          plan?: string | null
          billing_cycle?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          gst_number?: string | null
          notes?: string | null
          plan?: string | null
          billing_cycle?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          client_id: string | null
          server_id: string
          site_name: string
          domain_type: 'custom' | 'subdomain'
          apps: Json
          admin_password: string | null
          status: 'pending' | 'deploying' | 'active' | 'suspended' | 'failed' | 'deleted'
          ssl_enabled: boolean
          scheduler_enabled: boolean
          deployment_started_at: string | null
          deployment_completed_at: string | null
          deployment_log: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          server_id: string
          site_name: string
          domain_type?: 'custom' | 'subdomain'
          apps?: Json
          admin_password?: string | null
          status?: 'pending' | 'deploying' | 'active' | 'suspended' | 'failed' | 'deleted'
          ssl_enabled?: boolean
          scheduler_enabled?: boolean
          deployment_started_at?: string | null
          deployment_completed_at?: string | null
          deployment_log?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          server_id?: string
          site_name?: string
          domain_type?: 'custom' | 'subdomain'
          apps?: Json
          admin_password?: string | null
          status?: 'pending' | 'deploying' | 'active' | 'suspended' | 'failed' | 'deleted'
          ssl_enabled?: boolean
          scheduler_enabled?: boolean
          deployment_started_at?: string | null
          deployment_completed_at?: string | null
          deployment_log?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      backups: {
        Row: {
          id: string
          site_id: string
          server_id: string | null
          backup_type: 'full' | 'database' | 'files'
          trigger_type: 'manual' | 'scheduled'
          file_path: string | null
          file_size_mb: number | null
          remote_url: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          started_at: string | null
          completed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          server_id?: string | null
          backup_type?: 'full' | 'database' | 'files'
          trigger_type?: 'manual' | 'scheduled'
          file_path?: string | null
          file_size_mb?: number | null
          remote_url?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          server_id?: string | null
          backup_type?: 'full' | 'database' | 'files'
          trigger_type?: 'manual' | 'scheduled'
          file_path?: string | null
          file_size_mb?: number | null
          remote_url?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      deployment_jobs: {
        Row: {
          id: string
          site_id: string
          server_id: string | null
          job_type: 'site_creation' | 'app_install' | 'ssl_setup' | 'server_setup' | 'backup' | 'restore'
          status: 'queued' | 'running' | 'completed' | 'failed'
          current_step: string | null
          progress: number
          logs: string | null
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          server_id?: string | null
          job_type: 'site_creation' | 'app_install' | 'ssl_setup' | 'server_setup' | 'backup' | 'restore'
          status?: 'queued' | 'running' | 'completed' | 'failed'
          current_step?: string | null
          progress?: number
          logs?: string | null
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          server_id?: string | null
          job_type?: 'site_creation' | 'app_install' | 'ssl_setup' | 'server_setup' | 'backup' | 'restore'
          status?: 'queued' | 'running' | 'completed' | 'failed'
          current_step?: string | null
          progress?: number
          logs?: string | null
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          name: string | null
          role: 'admin' | 'member' | 'viewer'
          last_login_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          name?: string | null
          role?: 'admin' | 'member' | 'viewer'
          last_login_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'member' | 'viewer'
          last_login_at?: string | null
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          team_member_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_member_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_member_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string | null
          encrypted: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          encrypted?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          encrypted?: boolean
          updated_at?: string
        }
      }
    }
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>
        Returns: Json
      }
      get_server_stats: {
        Args: { server_uuid: string }
        Returns: Json
      }
    }
  }
}

// Helper types
export type Server = Database['public']['Tables']['servers']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Site = Database['public']['Tables']['sites']['Row']
export type Backup = Database['public']['Tables']['backups']['Row']
export type DeploymentJob = Database['public']['Tables']['deployment_jobs']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']

// Insert types
export type ServerInsert = Database['public']['Tables']['servers']['Insert']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type SiteInsert = Database['public']['Tables']['sites']['Insert']

// Extended types with relations
export type SiteWithRelations = Site & {
  server?: Server
  client?: Client
}

export type ServerWithStats = Server & {
  sites_count?: number
  active_sites?: number
}
