'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Server,
  Globe,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Terminal,
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
  Upload,
  Wifi,
  WifiOff,
  Plus,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

// Mock server data
const mockServer = {
  id: '1',
  name: 'Mumbai-1',
  location: 'Mumbai, India',
  ip_address: '103.xxx.xxx.10',
  ssh_user: 'frappe',
  ssh_port: 22,
  bench_path: '/home/frappe/frappe-bench',
  total_ram_gb: 16,
  total_cpu_cores: 4,
  total_disk_gb: 200,
  max_sites: 12,
  status: 'active',
  installed_apps: ['frappe', 'erpnext', 'hrms', 'payments', 'webshop', 'india_compliance', 'Trustbit'],
  mariadb_version: '10.6.12',
  frappe_version: '15.0.0',
  node_version: '18.19.0',
  python_version: '3.10.12',
  uptime: '45 days 12 hours',
  last_health_check: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  setup_completed_at: '2024-01-15T10:00:00Z',
  created_at: '2024-01-15T09:00:00Z',
  // Resource usage
  cpu_usage: 45,
  ram_usage: 62,
  ram_used_gb: 9.92,
  disk_usage: 55,
  disk_used_gb: 110,
  // Network
  bandwidth_in_gb: 45.2,
  bandwidth_out_gb: 23.8
}

const mockSites = [
  {
    id: '1',
    site_name: 'erp.acmecorp.com',
    client_name: 'Acme Corporation',
    status: 'active',
    apps: ['erpnext', 'hrms', 'payments'],
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    site_name: 'erp.bigcompany.in',
    client_name: 'Big Company Ltd',
    status: 'active',
    apps: ['erpnext', 'india_compliance'],
    created_at: '2024-02-15T10:00:00Z'
  },
  {
    id: '3',
    site_name: 'erp.techsolutions.com',
    client_name: 'Tech Solutions',
    status: 'active',
    apps: ['erpnext', 'hrms', 'payments', 'webshop'],
    created_at: '2024-03-01T10:00:00Z'
  },
  {
    id: '4',
    site_name: 'erp.suspended.com',
    client_name: 'Suspended Client',
    status: 'suspended',
    apps: ['erpnext'],
    created_at: '2024-03-10T10:00:00Z'
  }
]

const mockLogs = [
  { timestamp: '2024-12-24 10:00:00', level: 'info', message: 'Supervisor restarted successfully' },
  { timestamp: '2024-12-24 09:30:00', level: 'info', message: 'Nginx configuration reloaded' },
  { timestamp: '2024-12-24 02:00:00', level: 'info', message: 'Daily backup completed for 4 sites' },
  { timestamp: '2024-12-23 22:15:00', level: 'warning', message: 'High memory usage detected (78%)' },
  { timestamp: '2024-12-23 18:00:00', level: 'info', message: 'Site erp.newsite.com created successfully' },
]

function UsageCard({ 
  title, 
  icon: Icon, 
  value, 
  max, 
  unit,
  percentage 
}: { 
  title: string
  icon: React.ElementType
  value: number
  max: number
  unit: string
  percentage: number
}) {
  const color = percentage > 80 ? 'text-red-600' : percentage > 60 ? 'text-yellow-600' : 'text-green-600'
  const bgColor = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        <span className={`text-lg font-bold ${color}`}>{percentage}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${bgColor}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-sm text-gray-500">
        {value} {unit} / {max} {unit}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    suspended: { color: 'bg-red-100 text-red-700', icon: Pause },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    maintenance: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    offline: { color: 'bg-gray-100 text-gray-500', icon: WifiOff }
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

export default function ServerDetailPage() {
  const params = useParams()
  const [server] = useState(mockServer)
  const [sites] = useState(mockSites)
  const [logs] = useState(mockLogs)
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'logs' | 'settings'>('overview')
  const [showSSHKey, setShowSSHKey] = useState(false)
  const [isRunningCommand, setIsRunningCommand] = useState(false)

  const handleRunCommand = async (command: string) => {
    setIsRunningCommand(true)
    // TODO: Run command via SSH
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRunningCommand(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/servers"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{server.name}</h1>
                <StatusBadge status={server.status} />
              </div>
              <p className="text-gray-500">{server.location} • {server.ip_address}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleRunCommand('bench restart')}
            disabled={isRunningCommand}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunningCommand ? 'animate-spin' : ''}`} />
            Restart Services
          </button>
          <Link
            href={`/dashboard/sites/new?server=${server.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Deploy Site
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['overview', 'sites', 'logs', 'settings'].map((tab) => (
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
        <div className="space-y-6">
          {/* Resource Usage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UsageCard
              title="CPU Usage"
              icon={Cpu}
              value={server.cpu_usage}
              max={100}
              unit="%"
              percentage={server.cpu_usage}
            />
            <UsageCard
              title="Memory"
              icon={MemoryStick}
              value={server.ram_used_gb}
              max={server.total_ram_gb}
              unit="GB"
              percentage={server.ram_usage}
            />
            <UsageCard
              title="Disk"
              icon={HardDrive}
              value={server.disk_used_gb}
              max={server.total_disk_gb}
              unit="GB"
              percentage={server.disk_usage}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Server Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">IP Address</span>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{server.ip_address}</code>
                    <button onClick={() => copyToClipboard(server.ip_address)} className="ml-2 p-1 hover:bg-gray-100 rounded">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">SSH User</span>
                  <span className="text-gray-900">{server.ssh_user}@{server.ip_address}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">SSH Port</span>
                  <span className="text-gray-900">{server.ssh_port}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Bench Path</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{server.bench_path}</code>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Uptime</span>
                  <span className="text-green-600 font-medium">{server.uptime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Sites</span>
                  <span className="text-gray-900">{sites.length} / {server.max_sites}</span>
                </div>
              </div>
            </div>

            {/* Software Versions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Software Versions</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Frappe</span>
                  <span className="text-gray-900">v{server.frappe_version}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">MariaDB</span>
                  <span className="text-gray-900">v{server.mariadb_version}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Node.js</span>
                  <span className="text-gray-900">v{server.node_version}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Python</span>
                  <span className="text-gray-900">v{server.python_version}</span>
                </div>
              </div>

              <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Installed Apps</h3>
              <div className="flex flex-wrap gap-2">
                {server.installed_apps.map((app) => (
                  <span key={app} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleRunCommand('sudo supervisorctl restart all')}
                className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">Restart All</span>
              </button>
              <button
                onClick={() => handleRunCommand('bench setup nginx --yes && sudo systemctl reload nginx')}
                className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Globe className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">Reload Nginx</span>
              </button>
              <button
                onClick={() => handleRunCommand('bench update --pull')}
                className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium">Update Apps</span>
              </button>
              <button
                className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Terminal className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium">SSH Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sites Tab */}
      {activeTab === 'sites' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Apps</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{site.site_name}</p>
                        <a href={`https://${site.site_name}`} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center">
                          Visit <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{site.client_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {site.apps.slice(0, 3).map((app) => (
                        <span key={app} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {app}
                        </span>
                      ))}
                      {site.apps.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{site.apps.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={site.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/sites/${site.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Logs</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">Download Full Logs</button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            {logs.map((log, i) => (
              <div key={i} className="py-1">
                <span className="text-gray-500">{log.timestamp}</span>
                <span className={`mx-2 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warning' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Server Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Server Name</label>
                <input
                  type="text"
                  defaultValue={server.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Sites</label>
                <input
                  type="number"
                  defaultValue={server.max_sites}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-4">
              Removing this server will not delete sites. Make sure to migrate or backup all sites first.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Remove Server
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
