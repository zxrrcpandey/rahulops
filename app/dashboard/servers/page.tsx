'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Server,
  Plus,
  MoreVertical,
  Settings,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react'

// Mock data - replace with Supabase queries
const mockServers = [
  {
    id: '1',
    name: 'Mumbai-1',
    location: 'Mumbai, India',
    ip_address: '103.152.xxx.xxx',
    ssh_user: 'frappe',
    total_ram_gb: 16,
    total_cpu_cores: 4,
    total_disk_gb: 200,
    max_sites: 10,
    installed_apps: ['frappe', 'erpnext', 'hrms', 'payments', 'webshop', 'india_compliance', 'Trustbit'],
    status: 'active',
    sites_count: 4,
    created_at: '2024-01-15T10:00:00Z',
    last_health_check: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Singapore-1',
    location: 'Singapore',
    ip_address: '128.199.xxx.xxx',
    ssh_user: 'frappe',
    total_ram_gb: 32,
    total_cpu_cores: 8,
    total_disk_gb: 400,
    max_sites: 15,
    installed_apps: ['frappe', 'erpnext', 'hrms', 'payments'],
    status: 'active',
    sites_count: 3,
    created_at: '2024-02-20T10:00:00Z',
    last_health_check: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Frankfurt-1',
    location: 'Frankfurt, Germany',
    ip_address: '116.203.xxx.xxx',
    ssh_user: 'frappe',
    total_ram_gb: 16,
    total_cpu_cores: 4,
    total_disk_gb: 200,
    max_sites: 10,
    installed_apps: ['frappe', 'erpnext', 'hrms', 'payments', 'webshop'],
    status: 'active',
    sites_count: 8,
    created_at: '2024-03-10T10:00:00Z',
    last_health_check: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'New-Server',
    location: 'Delhi, India',
    ip_address: '157.245.xxx.xxx',
    ssh_user: 'frappe',
    total_ram_gb: 8,
    total_cpu_cores: 2,
    total_disk_gb: 100,
    max_sites: 5,
    installed_apps: [],
    status: 'pending',
    sites_count: 0,
    created_at: '2024-12-20T10:00:00Z',
    last_health_check: null
  }
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending Setup' },
    setup_running: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw, label: 'Setup Running' },
    maintenance: { color: 'bg-orange-100 text-orange-700', icon: Settings, label: 'Maintenance' },
    offline: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Offline' }
  }

  const { color, icon: Icon, label } = config[status] || config.active

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'setup_running' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  )
}

function formatTimeAgo(dateString: string | null) {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function ServersPage() {
  const [servers, setServers] = useState(mockServers)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

  const getLoadPercentage = (server: typeof mockServers[0]) => {
    return Math.round((server.sites_count / server.max_sites) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servers</h1>
          <p className="text-gray-500 mt-1">Manage your Hostinger VPS servers</p>
        </div>
        <Link
          href="/dashboard/servers/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Server
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Servers</p>
              <p className="text-2xl font-bold text-gray-900">{servers.length}</p>
            </div>
            <Server className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {servers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sites</p>
              <p className="text-2xl font-bold text-gray-900">
                {servers.reduce((acc, s) => acc + s.sites_count, 0)}
              </p>
            </div>
            <Globe className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {servers.reduce((acc, s) => acc + s.max_sites, 0)}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Server List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resources
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servers.map((server) => (
                <tr key={server.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Server className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{server.name}</p>
                        <p className="text-sm text-gray-500">{server.ip_address}</p>
                        <p className="text-xs text-gray-400">{server.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center text-gray-600">
                        <Cpu className="w-3 h-3 mr-1" />
                        {server.total_cpu_cores} vCPU
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Activity className="w-3 h-3 mr-1" />
                        {server.total_ram_gb} GB RAM
                      </div>
                      <div className="flex items-center text-gray-600">
                        <HardDrive className="w-3 h-3 mr-1" />
                        {server.total_disk_gb} GB Disk
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {server.sites_count}/{server.max_sites}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({getLoadPercentage(server)}%)
                        </span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            getLoadPercentage(server) > 80
                              ? 'bg-red-500'
                              : getLoadPercentage(server) > 60
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${getLoadPercentage(server)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {server.installed_apps.length > 0 ? (
                        server.installed_apps.slice(0, 3).map((app) => (
                          <span
                            key={app}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {app}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No apps</span>
                      )}
                      {server.installed_apps.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{server.installed_apps.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={server.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimeAgo(server.last_health_check)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === server.id ? null : server.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showDropdown === server.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <Link
                            href={`/dashboard/servers/${server.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                          {server.status === 'pending' && (
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Run Setup
                            </button>
                          )}
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Check Health
                          </button>
                          <hr className="my-1" />
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Server
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
