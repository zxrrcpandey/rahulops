'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Server,
  Users,
  Globe,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Bell,
  CreditCard,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  WifiOff,
  PlayCircle,
  PauseCircle,
  Ban
} from 'lucide-react'

// Types
interface DashboardStats {
  totalServers: number
  activeServers: number
  offlineServers: number
  totalClients: number
  activeClients: number
  suspendedClients: number
  totalSites: number
  activeSites: number
  suspendedSites: number
  pendingDeployments: number
  totalRevenue: number
  pendingPayments: number
  expiringThisWeek: number
  overduePayments: number
}

interface RecentActivity {
  id: string
  type: 'deployment' | 'payment' | 'suspension' | 'renewal' | 'backup' | 'alert'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

interface ExpiringSubscription {
  id: string
  clientName: string
  siteName: string
  expiresAt: string
  daysLeft: number
  amount: number
  status: 'active' | 'warning' | 'critical' | 'expired'
}

interface ServerHealth {
  id: string
  name: string
  ip: string
  location: string
  cpuUsage: number
  ramUsage: number
  diskUsage: number
  sitesCount: number
  maxSites: number
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: string
  lastCheck: string
}

// Mock data
const mockStats: DashboardStats = {
  totalServers: 4,
  activeServers: 3,
  offlineServers: 1,
  totalClients: 28,
  activeClients: 24,
  suspendedClients: 4,
  totalSites: 35,
  activeSites: 31,
  suspendedSites: 4,
  pendingDeployments: 2,
  totalRevenue: 285000,
  pendingPayments: 45000,
  expiringThisWeek: 5,
  overduePayments: 3
}

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'deployment',
    title: 'Site Deployed',
    description: 'erp.newclient.com deployed successfully on Mumbai-1',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'success'
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: 'Acme Corp paid ₹12,000 for monthly subscription',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'success'
  },
  {
    id: '3',
    type: 'alert',
    title: 'High CPU Usage',
    description: 'Frankfurt-1 server CPU at 85%',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'warning'
  },
  {
    id: '4',
    type: 'suspension',
    title: 'Site Auto-Suspended',
    description: 'erp.latepayer.com suspended due to overdue payment',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'error'
  },
  {
    id: '5',
    type: 'renewal',
    title: 'Subscription Renewed',
    description: 'Tech Solutions renewed for 12 months',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'success'
  },
  {
    id: '6',
    type: 'backup',
    title: 'Backup Completed',
    description: 'Daily backup for 12 sites completed',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    status: 'info'
  }
]

const mockExpiringSubscriptions: ExpiringSubscription[] = [
  {
    id: '1',
    clientName: 'Late Payer Inc',
    siteName: 'erp.latepayer.com',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    daysLeft: -2,
    amount: 8000,
    status: 'expired'
  },
  {
    id: '2',
    clientName: 'Almost Due Ltd',
    siteName: 'erp.almostdue.com',
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    daysLeft: 1,
    amount: 12000,
    status: 'critical'
  },
  {
    id: '3',
    clientName: 'Warning Company',
    siteName: 'erp.warning.in',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    daysLeft: 3,
    amount: 15000,
    status: 'warning'
  },
  {
    id: '4',
    clientName: 'Safe Client',
    siteName: 'erp.safeclient.com',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    daysLeft: 7,
    amount: 10000,
    status: 'active'
  }
]

const mockServerHealth: ServerHealth[] = [
  {
    id: '1',
    name: 'Mumbai-1',
    ip: '103.xxx.xxx.10',
    location: 'Mumbai, India',
    cpuUsage: 45,
    ramUsage: 62,
    diskUsage: 55,
    sitesCount: 8,
    maxSites: 12,
    status: 'healthy',
    uptime: '45 days',
    lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Singapore-1',
    ip: '103.xxx.xxx.20',
    location: 'Singapore',
    cpuUsage: 32,
    ramUsage: 48,
    diskUsage: 40,
    sitesCount: 5,
    maxSites: 15,
    status: 'healthy',
    uptime: '120 days',
    lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Frankfurt-1',
    ip: '103.xxx.xxx.30',
    location: 'Frankfurt, Germany',
    cpuUsage: 85,
    ramUsage: 78,
    diskUsage: 72,
    sitesCount: 10,
    maxSites: 10,
    status: 'warning',
    uptime: '30 days',
    lastCheck: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Delhi-1',
    ip: '103.xxx.xxx.40',
    location: 'Delhi, India',
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 0,
    sitesCount: 0,
    maxSites: 8,
    status: 'offline',
    uptime: '-',
    lastCheck: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
]

// Components
function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  href,
  color = 'blue'
}: {
  title: string
  value: number | string
  subValue?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  href: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-0.5">{subValue}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 mr-1" />
              ) : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    success: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    warning: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    error: { color: 'bg-red-100 text-red-700', icon: XCircle },
    info: { color: 'bg-blue-100 text-blue-700', icon: Activity },
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    critical: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    expired: { color: 'bg-gray-100 text-gray-700', icon: Ban },
    healthy: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    offline: { color: 'bg-gray-100 text-gray-500', icon: WifiOff }
  }

  const config = statusConfig[status] || statusConfig.info
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ElementType; color: string }> = {
    deployment: { icon: Globe, color: 'bg-blue-100 text-blue-600' },
    payment: { icon: CreditCard, color: 'bg-green-100 text-green-600' },
    suspension: { icon: PauseCircle, color: 'bg-red-100 text-red-600' },
    renewal: { icon: RefreshCw, color: 'bg-purple-100 text-purple-600' },
    backup: { icon: HardDrive, color: 'bg-gray-100 text-gray-600' },
    alert: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' }
  }

  const config = icons[type] || icons.alert
  const Icon = config.icon

  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function UsageBar({ value, max = 100, showLabel = true }: { value: number; max?: number; showLabel?: boolean }) {
  const percentage = (value / max) * 100
  const color = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="text-xs text-gray-500 w-10 text-right">{value}%</span>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity)
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<ExpiringSubscription[]>(mockExpiringSubscriptions)
  const [serverHealth, setServerHealth] = useState<ServerHealth[]>(mockServerHealth)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleSuspendSite = async (siteId: string) => {
    console.log('Suspending site:', siteId)
  }

  const handleActivateSite = async (siteId: string) => {
    console.log('Activating site:', siteId)
  }

  const handleSendReminder = async (subscriptionId: string) => {
    console.log('Sending reminder for:', subscriptionId)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your deployments.
          </p>
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
          <Link
            href="/dashboard/sites/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deployment
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.overduePayments > 0 || stats.offlineServers > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Attention Required</h3>
              <div className="mt-1 text-sm text-red-700 space-y-1">
                {stats.overduePayments > 0 && (
                  <p>• {stats.overduePayments} client(s) have overdue payments</p>
                )}
                {stats.offlineServers > 0 && (
                  <p>• {stats.offlineServers} server(s) are offline</p>
                )}
              </div>
            </div>
            <Link href="/dashboard/sites?status=suspended" className="text-red-600 hover:text-red-700 text-sm font-medium">
              View Details →
            </Link>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Sites"
          value={stats.activeSites}
          subValue={`${stats.suspendedSites} suspended`}
          icon={Globe}
          trend="up"
          trendValue="+3 this month"
          href="/dashboard/sites"
          color="green"
        />
        <StatCard
          title="Servers"
          value={stats.activeServers}
          subValue={`of ${stats.totalServers} total`}
          icon={Server}
          href="/dashboard/servers"
          color="blue"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subValue={`${formatCurrency(stats.pendingPayments)} pending`}
          icon={DollarSign}
          trend="up"
          trendValue="+12% vs last month"
          href="/dashboard/billing"
          color="purple"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringThisWeek}
          subValue="subscriptions this week"
          icon={Calendar}
          href="/dashboard/subscriptions"
          color={stats.expiringThisWeek > 3 ? 'red' : 'yellow'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Clients</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeClients}</p>
            </div>
            <Users className="w-8 h-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Suspended</p>
              <p className="text-xl font-bold text-red-600">{stats.suspendedClients}</p>
            </div>
            <Ban className="w-8 h-8 text-red-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending Deploy</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingDeployments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Overdue</p>
              <p className="text-xl font-bold text-red-600">{stats.overduePayments}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Health */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Server Health</h2>
            <Link href="/dashboard/servers" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center">
              Manage <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {serverHealth.map((server) => (
              <div
                key={server.id}
                className={`p-4 rounded-lg border ${
                  server.status === 'offline' ? 'bg-gray-50 border-gray-200' :
                  server.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      server.status === 'offline' ? 'bg-gray-200' :
                      server.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <Server className={`w-5 h-5 ${
                        server.status === 'offline' ? 'text-gray-400' :
                        server.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{server.name}</p>
                        <StatusBadge status={server.status} />
                      </div>
                      <p className="text-sm text-gray-500">{server.location} • {server.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{server.sitesCount}/{server.maxSites} sites</p>
                    <p className="text-xs text-gray-500">
                      {server.status !== 'offline' ? `Uptime: ${server.uptime}` : 'Last: ' + formatTimeAgo(server.lastCheck)}
                    </p>
                  </div>
                </div>
                
                {server.status !== 'offline' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span><Cpu className="w-3 h-3 inline mr-1" />CPU</span>
                        <span>{server.cpuUsage}%</span>
                      </div>
                      <UsageBar value={server.cpuUsage} showLabel={false} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span><MemoryStick className="w-3 h-3 inline mr-1" />RAM</span>
                        <span>{server.ramUsage}%</span>
                      </div>
                      <UsageBar value={server.ramUsage} showLabel={false} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span><HardDrive className="w-3 h-3 inline mr-1" />Disk</span>
                        <span>{server.diskUsage}%</span>
                      </div>
                      <UsageBar value={server.diskUsage} showLabel={false} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Subscriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Alerts
              {expiringSubscriptions.filter(s => s.daysLeft <= 3).length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                  {expiringSubscriptions.filter(s => s.daysLeft <= 3).length} critical
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-3">
            {expiringSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`p-4 rounded-lg border ${
                  sub.status === 'expired' ? 'bg-red-50 border-red-200' :
                  sub.status === 'critical' ? 'bg-orange-50 border-orange-200' :
                  sub.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.clientName}</p>
                    <p className="text-sm text-gray-500">{sub.siteName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(sub.amount)}</p>
                    <p className={`text-sm ${
                      sub.daysLeft < 0 ? 'text-red-600 font-medium' :
                      sub.daysLeft <= 1 ? 'text-orange-600' :
                      sub.daysLeft <= 3 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {sub.daysLeft < 0 ? `${Math.abs(sub.daysLeft)} days overdue` :
                       sub.daysLeft === 0 ? 'Expires today' :
                       sub.daysLeft === 1 ? 'Tomorrow' : `${sub.daysLeft} days left`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <button
                    onClick={() => handleSendReminder(sub.id)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Bell className="w-3 h-3 inline mr-1" />
                    Remind
                  </button>
                  {sub.status === 'expired' ? (
                    <button
                      onClick={() => handleActivateSite(sub.id)}
                      className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <PlayCircle className="w-3 h-3 inline mr-1" />
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspendSite(sub.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <PauseCircle className="w-3 h-3 inline mr-1" />
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Suspension Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-Suspension Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Auto-suspend on overdue</p>
                <p className="text-sm text-gray-500">Automatically suspend when payment overdue</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Grace period</p>
                <p className="text-sm text-gray-500">Days after due date before suspension</p>
              </div>
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                <option value="0">0 days</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Send reminder emails</p>
                <p className="text-sm text-gray-500">Notify clients before suspension</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/sites/new" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50">
                <Plus className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium">Deploy Site</span>
              </Link>
              <Link href="/dashboard/servers/new" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50">
                <Server className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium">Add Server</span>
              </Link>
              <Link href="/dashboard/backups" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50">
                <HardDrive className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium">Backups</span>
              </Link>
              <Link href="/dashboard/clients/new" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium">Add Client</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
