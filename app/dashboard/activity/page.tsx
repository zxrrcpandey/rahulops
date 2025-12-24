'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Globe,
  Server,
  Users,
  CreditCard,
  Database,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Mail,
  Key
} from 'lucide-react'

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  actionType: 'deployment' | 'server' | 'client' | 'billing' | 'backup' | 'security' | 'settings' | 'system'
  status: 'success' | 'warning' | 'error' | 'info'
  description: string
  entityType: 'site' | 'server' | 'client' | 'backup' | 'system'
  entityId: string
  entityName: string
  user: string
  userRole: 'admin' | 'member' | 'system'
  ipAddress: string
  details?: Record<string, any>
}

// Mock data with various activity types
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    action: 'site_deployed',
    actionType: 'deployment',
    status: 'success',
    description: 'Site deployed successfully',
    entityType: 'site',
    entityId: 'site-123',
    entityName: 'erp.newclient.com',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { apps: ['erpnext', 'hrms'], duration: '8m 32s' }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    action: 'payment_received',
    actionType: 'billing',
    status: 'success',
    description: 'Payment received from Acme Corp',
    entityType: 'client',
    entityId: 'client-456',
    entityName: 'Acme Corporation',
    user: 'System',
    userRole: 'system',
    ipAddress: '-',
    details: { amount: 12000, method: 'bank_transfer' }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    action: 'site_suspended',
    actionType: 'billing',
    status: 'warning',
    description: 'Site auto-suspended due to overdue payment',
    entityType: 'site',
    entityId: 'site-789',
    entityName: 'erp.latepayer.com',
    user: 'Auto-Suspension',
    userRole: 'system',
    ipAddress: '-',
    details: { daysOverdue: 5, amount: 8000 }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: 'backup_completed',
    actionType: 'backup',
    status: 'success',
    description: 'Daily backup completed',
    entityType: 'site',
    entityId: 'site-123',
    entityName: 'erp.acmecorp.com',
    user: 'Scheduler',
    userRole: 'system',
    ipAddress: '-',
    details: { size: '245 MB', type: 'full' }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    action: 'server_alert',
    actionType: 'server',
    status: 'warning',
    description: 'High CPU usage detected',
    entityType: 'server',
    entityId: 'server-001',
    entityName: 'Frankfurt-1',
    user: 'Health Monitor',
    userRole: 'system',
    ipAddress: '-',
    details: { cpu: 85, ram: 72, disk: 65 }
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    action: 'user_login',
    actionType: 'security',
    status: 'info',
    description: 'User logged in',
    entityType: 'system',
    entityId: 'user-001',
    entityName: 'Admin User',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { browser: 'Chrome', os: 'Windows' }
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    action: 'reminder_sent',
    actionType: 'billing',
    status: 'info',
    description: 'Payment reminder sent',
    entityType: 'client',
    entityId: 'client-789',
    entityName: 'Almost Due Ltd',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { daysLeft: 3, email: 'finance@almostdue.com' }
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    action: 'app_installed',
    actionType: 'deployment',
    status: 'success',
    description: 'New app installed on site',
    entityType: 'site',
    entityId: 'site-456',
    entityName: 'erp.techsolutions.com',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { app: 'hrms' }
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    action: 'ssl_renewed',
    actionType: 'security',
    status: 'success',
    description: 'SSL certificate renewed',
    entityType: 'site',
    entityId: 'site-123',
    entityName: 'erp.acmecorp.com',
    user: 'Certbot',
    userRole: 'system',
    ipAddress: '-',
    details: { validUntil: '2025-03-24' }
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    action: 'site_reactivated',
    actionType: 'billing',
    status: 'success',
    description: 'Site reactivated after payment',
    entityType: 'site',
    entityId: 'site-999',
    entityName: 'erp.renewed.com',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { newExpiry: '2025-01-24' }
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    action: 'backup_failed',
    actionType: 'backup',
    status: 'error',
    description: 'Backup failed due to insufficient disk space',
    entityType: 'site',
    entityId: 'site-456',
    entityName: 'erp.bigsite.com',
    user: 'Scheduler',
    userRole: 'system',
    ipAddress: '-',
    details: { error: 'Disk space below 10%' }
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    action: 'server_added',
    actionType: 'server',
    status: 'success',
    description: 'New server added to cluster',
    entityType: 'server',
    entityId: 'server-004',
    entityName: 'Delhi-1',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { ip: '103.xxx.xxx.40', ram: '8GB' }
  },
  {
    id: '13',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    action: 'client_created',
    actionType: 'client',
    status: 'success',
    description: 'New client added',
    entityType: 'client',
    entityId: 'client-new',
    entityName: 'New Startup Inc',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { plan: 'Professional' }
  },
  {
    id: '14',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    action: 'settings_updated',
    actionType: 'settings',
    status: 'info',
    description: 'Auto-suspension settings updated',
    entityType: 'system',
    entityId: 'settings',
    entityName: 'System Settings',
    user: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.100',
    details: { gracePeriod: 3, reminders: true }
  }
]

function getActionIcon(actionType: string) {
  const icons: Record<string, { icon: React.ElementType; color: string }> = {
    deployment: { icon: Globe, color: 'bg-blue-100 text-blue-600' },
    server: { icon: Server, color: 'bg-purple-100 text-purple-600' },
    client: { icon: Users, color: 'bg-green-100 text-green-600' },
    billing: { icon: CreditCard, color: 'bg-yellow-100 text-yellow-600' },
    backup: { icon: Database, color: 'bg-gray-100 text-gray-600' },
    security: { icon: Shield, color: 'bg-red-100 text-red-600' },
    settings: { icon: Settings, color: 'bg-orange-100 text-orange-600' },
    system: { icon: Activity, color: 'bg-indigo-100 text-indigo-600' }
  }
  return icons[actionType] || icons.system
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    success: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    warning: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    error: { color: 'bg-red-100 text-red-700', icon: XCircle },
    info: { color: 'bg-blue-100 text-blue-700', icon: Activity }
  }

  const c = config[status] || config.info
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  return 'Just now'
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ActivityPage() {
  const [logs, setLogs] = useState(mockActivityLogs)
  const [filter, setFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 10

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.actionType !== filter) return false
    if (statusFilter !== 'all' && log.status !== statusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        log.description.toLowerCase().includes(query) ||
        log.entityName.toLowerCase().includes(query) ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const activityStats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    warnings: logs.filter(l => l.status === 'warning').length,
    errors: logs.filter(l => l.status === 'error').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 mt-1">Track all system activities and events</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{activityStats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-green-600">{activityStats.success}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600">{activityStats.warnings}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Errors</p>
          <p className="text-2xl font-bold text-red-600">{activityStats.errors}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Type:</span>
          <div className="flex space-x-1">
            {['all', 'deployment', 'billing', 'backup', 'server', 'security'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === type
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {paginatedLogs.map((log) => {
            const iconConfig = getActionIcon(log.actionType)
            const Icon = iconConfig.icon

            return (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconConfig.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{log.description}</p>
                        <StatusBadge status={log.status} />
                      </div>
                      <span className="text-sm text-gray-500">{formatTimeAgo(log.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        {log.entityType === 'site' && <Globe className="w-3 h-3 mr-1" />}
                        {log.entityType === 'server' && <Server className="w-3 h-3 mr-1" />}
                        {log.entityType === 'client' && <Users className="w-3 h-3 mr-1" />}
                        {log.entityType === 'backup' && <Database className="w-3 h-3 mr-1" />}
                        <Link 
                          href={`/dashboard/${log.entityType}s/${log.entityId}`}
                          className="hover:text-blue-600"
                        >
                          {log.entityName}
                        </Link>
                      </span>
                      <span>•</span>
                      <span className={`${log.userRole === 'system' ? 'text-gray-400' : ''}`}>
                        {log.user}
                      </span>
                      {log.ipAddress !== '-' && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-xs">{log.ipAddress}</span>
                        </>
                      )}
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(log.details).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {paginatedLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} results
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
