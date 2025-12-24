'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Ban,
  DollarSign,
  Activity,
  FileText,
  Send,
  Download,
  ExternalLink
} from 'lucide-react'

// Mock client data
const mockClient = {
  id: '1',
  name: 'Rajesh Kumar',
  company: 'Acme Corporation',
  email: 'rajesh@acmecorp.com',
  phone: '+91 98765 43210',
  alternate_phone: '+91 98765 43211',
  address: '123 Business Park, Andheri East',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400069',
  gst_number: '27AABCU9603R1ZM',
  pan_number: 'AABCU9603R',
  plan: 'Professional',
  billing_cycle: 'monthly',
  created_at: '2024-01-15T10:00:00Z',
  notes: 'Key client. Needs priority support. Prefers communication via WhatsApp.',
  tags: ['priority', 'enterprise', 'india'],
  // Stats
  total_sites: 2,
  active_sites: 2,
  total_spent: 144000,
  pending_amount: 12000,
  subscription_status: 'active'
}

const mockSites = [
  {
    id: '1',
    site_name: 'erp.acmecorp.com',
    server_name: 'Mumbai-1',
    apps: ['erpnext', 'hrms', 'payments', 'india_compliance'],
    status: 'active',
    plan: 'Professional',
    amount: 12000,
    expires_at: '2025-01-20T00:00:00Z',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    site_name: 'test.acmecorp.com',
    server_name: 'Mumbai-1',
    apps: ['erpnext'],
    status: 'active',
    plan: 'Starter',
    amount: 5000,
    expires_at: '2025-02-15T00:00:00Z',
    created_at: '2024-02-15T10:00:00Z'
  }
]

const mockPayments = [
  { id: '1', invoice: 'INV-2024-012', amount: 12000, status: 'completed', date: '2024-12-20T10:00:00Z', method: 'Bank Transfer' },
  { id: '2', invoice: 'INV-2024-011', amount: 12000, status: 'completed', date: '2024-11-20T10:00:00Z', method: 'UPI' },
  { id: '3', invoice: 'INV-2024-010', amount: 12000, status: 'completed', date: '2024-10-20T10:00:00Z', method: 'Bank Transfer' },
  { id: '4', invoice: 'INV-2024-009', amount: 5000, status: 'completed', date: '2024-09-20T10:00:00Z', method: 'UPI' },
]

const mockActivityLog = [
  { id: '1', action: 'Payment received', description: '₹12,000 via Bank Transfer', timestamp: '2024-12-20T10:00:00Z' },
  { id: '2', action: 'Invoice sent', description: 'INV-2024-012 for January 2025', timestamp: '2024-12-15T09:00:00Z' },
  { id: '3', action: 'Site backup', description: 'erp.acmecorp.com full backup', timestamp: '2024-12-10T02:00:00Z' },
  { id: '4', action: 'Support ticket closed', description: 'Issue with PDF generation resolved', timestamp: '2024-12-05T14:30:00Z' },
  { id: '5', action: 'New site created', description: 'test.acmecorp.com deployed', timestamp: '2024-02-15T10:00:00Z' },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    suspended: { color: 'bg-red-100 text-red-700', icon: Ban },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle }
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

export default function ClientDetailPage() {
  const params = useParams()
  const [client] = useState(mockClient)
  const [sites] = useState(mockSites)
  const [payments] = useState(mockPayments)
  const [activityLog] = useState(mockActivityLog)
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'billing' | 'activity'>('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/clients" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">
                {client.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <StatusBadge status={client.subscription_status} />
              </div>
              <div className="flex items-center space-x-3 text-gray-500">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {client.company}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {client.city}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </button>
          <Link
            href={`/dashboard/sites/new?client=${client.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Deploy Site
          </Link>
          <Link
            href={`/dashboard/clients/${client.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Sites</p>
              <p className="text-2xl font-bold text-gray-900">{client.active_sites}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(client.total_spent)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(client.pending_amount)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-2xl font-bold text-purple-600">{client.plan}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['overview', 'sites', 'billing', 'activity'].map((tab) => (
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
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {client.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {client.phone}
                    </p>
                  </div>
                  {client.alternate_phone && (
                    <div>
                      <p className="text-sm text-gray-500">Alternate Phone</p>
                      <p className="flex items-center text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {client.alternate_phone}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{client.address}</p>
                    <p className="text-gray-500">{client.city}, {client.state} - {client.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-gray-900 font-mono">{client.gst_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-gray-900 font-mono">{client.pan_number || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sites Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Sites</h2>
                <Link href={`/dashboard/sites/new?client=${client.id}`} className="text-blue-600 hover:text-blue-700 text-sm">
                  + Add Site
                </Link>
              </div>
              <div className="space-y-3">
                {sites.map((site) => {
                  const daysLeft = getDaysUntil(site.expires_at)
                  return (
                    <div key={site.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{site.site_name}</p>
                            <StatusBadge status={site.status} />
                          </div>
                          <p className="text-sm text-gray-500">
                            {site.server_name} • {site.apps.length} apps
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(site.amount)}/mo</p>
                        <p className={`text-sm ${daysLeft <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                          Expires: {formatDate(site.expires_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-600">{client.notes || 'No notes added.'}</p>
              <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Edit Notes
              </button>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
                <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-blue-500 hover:text-blue-500">
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-3" />
                    <span>Generate Invoice</span>
                  </span>
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left">
                  <span className="flex items-center">
                    <Send className="w-5 h-5 text-green-500 mr-3" />
                    <span>Send Payment Reminder</span>
                  </span>
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left">
                  <span className="flex items-center">
                    <Download className="w-5 h-5 text-purple-500 mr-3" />
                    <span>Export Data</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client Since</span>
                  <span className="text-gray-900">{formatDate(client.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Billing Cycle</span>
                  <span className="text-gray-900 capitalize">{client.billing_cycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="text-purple-600 font-medium">{client.plan}</span>
                </div>
              </div>
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Server</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Apps</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Expires</th>
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
                  <td className="px-6 py-4 text-gray-500">{site.server_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {site.apps.slice(0, 2).map((app) => (
                        <span key={app} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{app}</span>
                      ))}
                      {site.apps.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{site.apps.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">{site.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={site.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(site.expires_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/sites/${site.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              <FileText className="w-4 h-4 inline mr-2" />
              Generate Invoice
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-600">{payment.invoice}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-gray-500">{payment.method}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(payment.date)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Log</h2>
          <div className="space-y-4">
            {activityLog.map((log, index) => (
              <div key={log.id} className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <span className="text-sm text-gray-400">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
