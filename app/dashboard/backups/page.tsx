'use client'

import { useState } from 'react'
import {
  Database,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Settings,
  Trash2,
  MoreVertical,
  HardDrive
} from 'lucide-react'

// Mock data
const mockBackups = [
  {
    id: '1',
    site_name: 'erp.acmecorp.com',
    backup_type: 'full',
    trigger_type: 'scheduled',
    status: 'completed',
    file_size_mb: 245.5,
    created_at: '2024-12-24T02:00:00Z',
    completed_at: '2024-12-24T02:15:00Z'
  },
  {
    id: '2',
    site_name: 'erp.bigcompany.in',
    backup_type: 'full',
    trigger_type: 'manual',
    status: 'completed',
    file_size_mb: 512.3,
    created_at: '2024-12-23T14:30:00Z',
    completed_at: '2024-12-23T14:52:00Z'
  },
  {
    id: '3',
    site_name: 'erp.techsolutions.com',
    backup_type: 'database',
    trigger_type: 'scheduled',
    status: 'running',
    file_size_mb: null,
    created_at: '2024-12-24T10:00:00Z',
    completed_at: null
  },
  {
    id: '4',
    site_name: 'erp.newclient.com',
    backup_type: 'full',
    trigger_type: 'scheduled',
    status: 'failed',
    file_size_mb: null,
    created_at: '2024-12-24T02:00:00Z',
    completed_at: '2024-12-24T02:05:00Z',
    error_message: 'Insufficient disk space'
  }
]

const mockSchedules = [
  {
    id: '1',
    site_name: 'erp.acmecorp.com',
    frequency: 'daily',
    time_utc: '02:00',
    backup_type: 'full',
    retention_days: 30,
    is_active: true,
    last_run_at: '2024-12-24T02:00:00Z',
    next_run_at: '2024-12-25T02:00:00Z'
  },
  {
    id: '2',
    site_name: 'erp.bigcompany.in',
    frequency: 'weekly',
    time_utc: '03:00',
    backup_type: 'full',
    retention_days: 60,
    is_active: true,
    last_run_at: '2024-12-22T03:00:00Z',
    next_run_at: '2024-12-29T03:00:00Z'
  },
  {
    id: '3',
    site_name: 'erp.techsolutions.com',
    frequency: 'daily',
    time_utc: '04:00',
    backup_type: 'database',
    retention_days: 14,
    is_active: false,
    last_run_at: '2024-12-20T04:00:00Z',
    next_run_at: null
  }
]

// Mock sites for backup trigger
const mockSites = [
  { id: '1', site_name: 'erp.acmecorp.com' },
  { id: '2', site_name: 'erp.bigcompany.in' },
  { id: '3', site_name: 'erp.techsolutions.com' },
  { id: '4', site_name: 'erp.newclient.com' }
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    running: { color: 'bg-blue-100 text-blue-700', icon: Loader2 },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock }
  }

  const c = config[status] || config.pending
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatFileSize(mb: number | null) {
  if (mb === null) return '-'
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

export default function BackupsPage() {
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules'>('backups')
  const [backups] = useState(mockBackups)
  const [schedules] = useState(mockSchedules)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState('')
  const [backupType, setBackupType] = useState('full')
  const [isTriggering, setIsTriggering] = useState(false)

  const handleTriggerBackup = async () => {
    if (!selectedSite) return
    setIsTriggering(true)
    
    // TODO: Trigger backup via API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsTriggering(false)
    setShowBackupModal(false)
    setSelectedSite('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backups</h1>
          <p className="text-gray-500 mt-1">Manage site backups and schedules</p>
        </div>
        <button
          onClick={() => setShowBackupModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-4 h-4 mr-2" />
          Trigger Backup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Backups</p>
          <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Successful</p>
          <p className="text-2xl font-bold text-green-600">
            {backups.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            {backups.filter(b => b.status === 'failed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Size</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatFileSize(backups.reduce((acc, b) => acc + (b.file_size_mb || 0), 0))}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'backups'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Backup History
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'schedules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedules
          </button>
        </div>
      </div>

      {/* Backup History Tab */}
      {activeTab === 'backups' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trigger</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <HardDrive className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{backup.site_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      backup.backup_type === 'full' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {backup.backup_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {backup.trigger_type === 'scheduled' ? (
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> Scheduled
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Play className="w-3 h-3 mr-1" /> Manual
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={backup.status} />
                    {backup.error_message && (
                      <p className="text-xs text-red-500 mt-1">{backup.error_message}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatFileSize(backup.file_size_mb)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(backup.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {backup.status === 'completed' && (
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Restore">
                          <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time (UTC)</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Retention</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Next Run</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{schedule.site_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {schedule.frequency}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {schedule.time_utc}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      schedule.backup_type === 'full' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {schedule.backup_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {schedule.retention_days} days
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      schedule.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {schedule.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {schedule.next_run_at ? formatDate(schedule.next_run_at) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trigger Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trigger Manual Backup</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Site
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a site...</option>
                  {mockSites.map(site => (
                    <option key={site.id} value={site.id}>{site.site_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Type
                </label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full">Full Backup (Database + Files)</option>
                  <option value="database">Database Only</option>
                  <option value="files">Files Only</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBackupModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerBackup}
                disabled={!selectedSite || isTriggering}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
