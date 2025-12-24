'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Globe,
  Plus,
  MoreVertical,
  ExternalLink,
  Key,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Mail
} from 'lucide-react'

// Mock data - replace with Supabase queries
const mockSites = [
  {
    id: '1',
    site_name: 'erp.acmecorp.com',
    client: { name: 'Acme Corporation', email: 'admin@acmecorp.com' },
    server: { name: 'Mumbai-1', ip_address: '103.152.xxx.xxx' },
    apps: ['erpnext', 'hrms', 'payments', 'india_compliance'],
    status: 'active',
    ssl_enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    deployment_completed_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    site_name: 'erp.newclient.com',
    client: { name: 'New Client', email: 'admin@newclient.com' },
    server: { name: 'Singapore-1', ip_address: '128.199.xxx.xxx' },
    apps: ['erpnext', 'hrms'],
    status: 'deploying',
    ssl_enabled: false,
    created_at: '2024-12-24T08:00:00Z',
    deployment_completed_at: null,
  },
  {
    id: '3',
    site_name: 'erp.bigcompany.in',
    client: { name: 'Big Company Ltd', email: 'admin@bigcompany.in' },
    server: { name: 'Mumbai-1', ip_address: '103.152.xxx.xxx' },
    apps: ['erpnext', 'hrms', 'payments', 'webshop', 'india_compliance'],
    status: 'active',
    ssl_enabled: true,
    created_at: '2024-02-20T10:00:00Z',
    deployment_completed_at: '2024-02-20T10:25:00Z',
  },
  {
    id: '4',
    site_name: 'erp.startup.io',
    client: { name: 'Startup Inc', email: 'admin@startup.io' },
    server: { name: 'Frankfurt-1', ip_address: '116.203.xxx.xxx' },
    apps: ['erpnext'],
    status: 'failed',
    ssl_enabled: false,
    created_at: '2024-12-23T15:00:00Z',
    deployment_completed_at: null,
  },
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Pending' },
    deploying: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw, label: 'Deploying' },
    suspended: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Suspended' },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
    deleted: { color: 'bg-gray-100 text-gray-500', icon: Trash2, label: 'Deleted' },
  }

  const { color, icon: Icon, label } = config[status] || config.pending

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'deploying' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  )
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SitesPage() {
  const [sites, setSites] = useState(mockSites)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState<string | null>(null)

  const filteredSites = sites.filter(site => {
    const matchesSearch = 
      site.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: sites.length,
    active: sites.filter(s => s.status === 'active').length,
    deploying: sites.filter(s => s.status === 'deploying').length,
    failed: sites.filter(s => s.status === 'failed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500 mt-1">Manage all ERPNext sites across your servers</p>
        </div>
        <Link
          href="/dashboard/sites/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Deploy New Site
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sites or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status ({statusCounts.all})</option>
            <option value="active">Active ({statusCounts.active})</option>
            <option value="deploying">Deploying ({statusCounts.deploying})</option>
            <option value="failed">Failed ({statusCounts.failed})</option>
          </select>
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900">{site.site_name}</p>
                          {site.ssl_enabled && (
                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              SSL
                            </span>
                          )}
                        </div>
                        {site.status === 'active' && (
                          <a
                            href={`https://${site.site_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            Open site
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-gray-900">{site.client.name}</p>
                    <p className="text-sm text-gray-500">{site.client.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-gray-900">{site.server.name}</p>
                    <p className="text-sm text-gray-500">{site.server.ip_address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {site.apps.slice(0, 2).map((app) => (
                        <span
                          key={app}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {app}
                        </span>
                      ))}
                      {site.apps.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{site.apps.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={site.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(site.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === site.id ? null : site.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showDropdown === site.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {site.status === 'active' && (
                            <>
                              <button
                                onClick={() => {
                                  setShowCredentials(site.id)
                                  setShowDropdown(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Key className="w-4 h-4 mr-2" />
                                View Credentials
                              </button>
                              <a
                                href={`https://${site.site_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Site
                              </a>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" />
                                Backup Now
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Mail className="w-4 h-4 mr-2" />
                                Email Credentials
                              </button>
                            </>
                          )}
                          {site.status === 'failed' && (
                            <button className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-50">
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Retry Deployment
                            </button>
                          )}
                          <hr className="my-1" />
                          <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Site
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

        {filteredSites.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sites found</p>
            <Link
              href="/dashboard/sites/new"
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Deploy your first site
            </Link>
          </div>
        )}
      </div>

      {/* Credentials Modal */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Credentials</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Site URL</p>
                <p className="font-mono text-gray-900">
                  https://{sites.find(s => s.id === showCredentials)?.site_name}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Admin Username</p>
                <p className="font-mono text-gray-900">Administrator</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Admin Password</p>
                <p className="font-mono text-gray-900">••••••••••••••••</p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                  Show password
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCredentials(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Copy All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
