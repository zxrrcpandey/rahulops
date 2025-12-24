'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Globe,
  Server,
  User,
  Package,
  Shield,
  Database,
  RefreshCw,
  Settings,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Key,
  Calendar,
  CreditCard,
  Mail,
  Bell,
  Lock,
  Unlock,
  Activity,
  HardDrive
} from 'lucide-react'

// Mock site data
const mockSite = {
  id: '1',
  site_name: 'erp.acmecorp.com',
  client: {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'Acme Corporation',
    email: 'rajesh@acmecorp.com',
    phone: '+91 98765 43210'
  },
  server: {
    id: '1',
    name: 'Mumbai-1',
    ip_address: '103.xxx.xxx.10'
  },
  domain_type: 'custom',
  apps: ['erpnext', 'hrms', 'payments', 'india_compliance'],
  status: 'active',
  ssl_enabled: true,
  scheduler_enabled: true,
  admin_password: 'SecureP@ss123!',
  created_at: '2024-01-20T10:00:00Z',
  deployment_completed_at: '2024-01-20T10:15:00Z',
  // Subscription
  subscription: {
    plan: 'Professional',
    amount: 12000,
    billing_cycle: 'monthly',
    started_at: '2024-01-20T00:00:00Z',
    expires_at: '2025-01-20T00:00:00Z',
    next_billing: '2025-01-20T00:00:00Z',
    status: 'active'
  },
  // Usage stats
  usage: {
    users: 15,
    storage_used_gb: 2.5,
    api_calls_today: 1250,
    last_login: '2024-12-24T08:30:00Z'
  }
}

const mockBackups = [
  {
    id: '1',
    type: 'full',
    size_mb: 245,
    status: 'completed',
    created_at: '2024-12-24T02:00:00Z'
  },
  {
    id: '2',
    type: 'full',
    size_mb: 242,
    status: 'completed',
    created_at: '2024-12-23T02:00:00Z'
  },
  {
    id: '3',
    type: 'database',
    size_mb: 85,
    status: 'completed',
    created_at: '2024-12-22T02:00:00Z'
  }
]

const mockActivityLog = [
  { timestamp: '2024-12-24 10:30:00', action: 'User login', user: 'Administrator', ip: '192.168.1.100' },
  { timestamp: '2024-12-24 09:15:00', action: 'Sales Invoice created', user: 'accounts@acme.com', ip: '192.168.1.105' },
  { timestamp: '2024-12-24 08:45:00', action: 'Purchase Order submitted', user: 'purchase@acme.com', ip: '192.168.1.102' },
  { timestamp: '2024-12-23 18:00:00', action: 'Daily backup completed', user: 'System', ip: '-' },
  { timestamp: '2024-12-23 14:30:00', action: 'New user created', user: 'Administrator', ip: '192.168.1.100' },
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    suspended: { color: 'bg-red-100 text-red-700', icon: Pause },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    deploying: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle }
  }

  const c = config[status] || config.active
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function getDaysUntil(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export default function SiteDetailPage() {
  const params = useParams()
  const [site] = useState(mockSite)
  const [backups] = useState(mockBackups)
  const [activityLog] = useState(mockActivityLog)
  const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'backups' | 'billing' | 'settings'>('overview')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: string) => {
    setIsLoading(true)
    console.log('Performing action:', action)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const daysUntilExpiry = getDaysUntil(site.subscription.expires_at)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sites" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{site.site_name}</h1>
                <StatusBadge status={site.status} />
                {site.ssl_enabled && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> SSL
                  </span>
                )}
              </div>
              <p className="text-gray-500">
                {site.client.company} • Server: {site.server.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href={`https://${site.site_name}`}
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Site
          </a>
          {site.status === 'active' ? (
            <button
              onClick={() => handleAction('suspend')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Pause className="w-4 h-4 mr-2" />
              Suspend
            </button>
          ) : (
            <button
              onClick={() => handleAction('activate')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Activate
            </button>
          )}
        </div>
      </div>

      {/* Subscription Warning Banner */}
      {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">
                Subscription expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </p>
              <p className="text-yellow-700 text-sm">
                Renew now to avoid service interruption
              </p>
            </div>
            <button className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700">
              Renew Now
            </button>
          </div>
        </div>
      )}

      {daysUntilExpiry <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">
                Subscription expired {Math.abs(daysUntilExpiry)} day{Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago
              </p>
              <p className="text-red-700 text-sm">
                Site will be suspended soon. Renew immediately.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
              Renew Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['overview', 'credentials', 'backups', 'billing', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Site Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Domain</p>
                  <p className="font-medium text-gray-900">{site.site_name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Server</p>
                  <Link href={`/dashboard/servers/${site.server.id}`} className="font-medium text-blue-600 hover:underline">
                    {site.server.name}
                  </Link>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{formatDate(site.created_at)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">SSL Certificate</p>
                  <p className="font-medium text-green-600 flex items-center">
                    <Lock className="w-4 h-4 mr-1" /> Active
                  </p>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Installed Apps</h3>
              <div className="flex flex-wrap gap-2">
                {site.apps.map((app) => (
                  <span key={app} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    <Package className="w-4 h-4 inline mr-1" />
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <User className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{site.usage.users}</p>
                  <p className="text-sm text-gray-500">Active Users</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <HardDrive className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{site.usage.storage_used_gb} GB</p>
                  <p className="text-sm text-gray-500">Storage Used</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{site.usage.api_calls_today}</p>
                  <p className="text-sm text-gray-500">API Calls Today</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{formatDateTime(site.usage.last_login).split(',')[1]}</p>
                  <p className="text-sm text-gray-500">Last Login</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">{log.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client & Quick Actions */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">
                      {site.client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{site.client.name}</p>
                    <p className="text-sm text-gray-500">{site.client.company}</p>
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <a href={`mailto:${site.client.email}`} className="text-blue-600 hover:underline">
                      {site.client.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    {site.client.phone}
                  </div>
                </div>
                <Link
                  href={`/dashboard/clients/${site.client.id}`}
                  className="block w-full text-center mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                >
                  View Client Details
                </Link>
              </div>
            </div>

            {/* Subscription Card */}
            <div className={`rounded-xl border p-6 ${
              daysUntilExpiry <= 0 ? 'bg-red-50 border-red-200' :
              daysUntilExpiry <= 7 ? 'bg-yellow-50 border-yellow-200' :
              'bg-white border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-purple-600">{site.subscription.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{formatCurrency(site.subscription.amount)}/{site.subscription.billing_cycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expires</span>
                  <span className={`font-medium ${daysUntilExpiry <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(site.subscription.expires_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Days Left</span>
                  <span className={`font-bold ${
                    daysUntilExpiry <= 0 ? 'text-red-600' :
                    daysUntilExpiry <= 7 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {daysUntilExpiry <= 0 ? `${Math.abs(daysUntilExpiry)} days overdue` : `${daysUntilExpiry} days`}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                Renew Subscription
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleAction('backup')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="flex items-center">
                    <Database className="w-5 h-5 text-blue-500 mr-3" />
                    <span>Create Backup</span>
                  </span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
                <button
                  onClick={() => handleAction('restart')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-green-500 mr-3" />
                    <span>Restart Site</span>
                  </span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
                <button
                  onClick={() => handleAction('clear-cache')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="flex items-center">
                    <Trash2 className="w-5 h-5 text-orange-500 mr-3" />
                    <span>Clear Cache</span>
                  </span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
                <button
                  onClick={() => handleAction('send-reminder')}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="flex items-center">
                    <Bell className="w-5 h-5 text-purple-500 mr-3" />
                    <span>Send Payment Reminder</span>
                  </span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Access Credentials</h2>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={`https://${site.site_name}`}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg"
                />
                <button
                  onClick={() => copyToClipboard(`https://${site.site_name}`)}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                  <Copy className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username</label>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value="Administrator"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg"
                />
                <button
                  onClick={() => copyToClipboard('Administrator')}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                  <Copy className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
              <div className="flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly
                  value={site.admin_password}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-lg"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2 border border-l-0 border-gray-300 hover:bg-gray-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
                <button
                  onClick={() => copyToClipboard(site.admin_password)}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                  <Copy className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="pt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Key className="w-4 h-4 inline mr-2" />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
            <button
              onClick={() => handleAction('backup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Database className="w-4 h-4 inline mr-2" />
              Create Backup Now
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(backup.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        backup.type === 'full' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{backup.size_mb} MB</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={backup.status === 'completed' ? 'active' : backup.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-4">
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        <RefreshCw className="w-4 h-4 inline mr-1" />
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-xl font-bold text-purple-600">{site.subscription.plan}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(site.subscription.amount)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{site.subscription.billing_cycle}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Next Billing</p>
                <p className="text-xl font-bold text-gray-900">{formatDate(site.subscription.next_billing)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            <p className="text-gray-500">No payment history available. Payment tracking coming soon.</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Scheduler</p>
                  <p className="text-sm text-gray-500">Background job scheduler for this site</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={site.scheduler_enabled} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Temporarily disable site access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-4">
              These actions are destructive and cannot be undone.
            </p>
            <div className="space-x-3">
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100">
                Delete Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
