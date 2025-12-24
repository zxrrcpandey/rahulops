'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Bell,
  Mail,
  RefreshCw,
  Play,
  Pause,
  Filter,
  Download,
  TrendingUp,
  Users,
  Globe,
  Settings,
  ChevronDown,
  Search
} from 'lucide-react'

// Types
interface Subscription {
  id: string
  client: {
    id: string
    name: string
    company: string
    email: string
  }
  site: {
    id: string
    name: string
    status: 'active' | 'suspended' | 'pending'
  }
  plan: string
  amount: number
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  started_at: string
  expires_at: string
  last_payment_at: string | null
  next_billing_at: string
  status: 'active' | 'expiring' | 'overdue' | 'suspended' | 'cancelled'
  auto_renew: boolean
  grace_period_days: number
  reminder_sent: boolean
}

interface PaymentHistory {
  id: string
  client_name: string
  site_name: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  payment_method: string
  paid_at: string
  invoice_id: string
}

// Mock data
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    client: { id: '1', name: 'Rajesh Kumar', company: 'Acme Corporation', email: 'rajesh@acmecorp.com' },
    site: { id: '1', name: 'erp.acmecorp.com', status: 'active' },
    plan: 'Professional',
    amount: 12000,
    billing_cycle: 'monthly',
    started_at: '2024-01-20T00:00:00Z',
    expires_at: '2025-01-20T00:00:00Z',
    last_payment_at: '2024-12-20T00:00:00Z',
    next_billing_at: '2025-01-20T00:00:00Z',
    status: 'active',
    auto_renew: true,
    grace_period_days: 3,
    reminder_sent: false
  },
  {
    id: '2',
    client: { id: '2', name: 'Priya Sharma', company: 'Big Company Ltd', email: 'priya@bigcompany.in' },
    site: { id: '2', name: 'erp.bigcompany.in', status: 'active' },
    plan: 'Enterprise',
    amount: 25000,
    billing_cycle: 'monthly',
    started_at: '2024-03-01T00:00:00Z',
    expires_at: '2024-12-25T00:00:00Z',
    last_payment_at: '2024-11-25T00:00:00Z',
    next_billing_at: '2024-12-25T00:00:00Z',
    status: 'expiring',
    auto_renew: true,
    grace_period_days: 3,
    reminder_sent: true
  },
  {
    id: '3',
    client: { id: '3', name: 'Amit Patel', company: 'Tech Solutions', email: 'amit@techsolutions.com' },
    site: { id: '3', name: 'erp.techsolutions.com', status: 'active' },
    plan: 'Professional',
    amount: 15000,
    billing_cycle: 'monthly',
    started_at: '2024-02-15T00:00:00Z',
    expires_at: '2024-12-22T00:00:00Z',
    last_payment_at: '2024-11-22T00:00:00Z',
    next_billing_at: '2024-12-22T00:00:00Z',
    status: 'overdue',
    auto_renew: false,
    grace_period_days: 3,
    reminder_sent: true
  },
  {
    id: '4',
    client: { id: '4', name: 'Sneha Reddy', company: 'Late Payer Inc', email: 'sneha@latepayer.com' },
    site: { id: '4', name: 'erp.latepayer.com', status: 'suspended' },
    plan: 'Starter',
    amount: 8000,
    billing_cycle: 'monthly',
    started_at: '2024-04-01T00:00:00Z',
    expires_at: '2024-12-18T00:00:00Z',
    last_payment_at: '2024-11-18T00:00:00Z',
    next_billing_at: '2024-12-18T00:00:00Z',
    status: 'suspended',
    auto_renew: false,
    grace_period_days: 3,
    reminder_sent: true
  },
  {
    id: '5',
    client: { id: '5', name: 'Vikram Singh', company: 'Good Client Co', email: 'vikram@goodclient.com' },
    site: { id: '5', name: 'erp.goodclient.com', status: 'active' },
    plan: 'Enterprise',
    amount: 30000,
    billing_cycle: 'yearly',
    started_at: '2024-01-01T00:00:00Z',
    expires_at: '2025-06-01T00:00:00Z',
    last_payment_at: '2024-06-01T00:00:00Z',
    next_billing_at: '2025-06-01T00:00:00Z',
    status: 'active',
    auto_renew: true,
    grace_period_days: 7,
    reminder_sent: false
  }
]

const mockPaymentHistory: PaymentHistory[] = [
  { id: '1', client_name: 'Acme Corporation', site_name: 'erp.acmecorp.com', amount: 12000, status: 'completed', payment_method: 'Bank Transfer', paid_at: '2024-12-20T10:30:00Z', invoice_id: 'INV-2024-001' },
  { id: '2', client_name: 'Good Client Co', site_name: 'erp.goodclient.com', amount: 30000, status: 'completed', payment_method: 'UPI', paid_at: '2024-12-15T14:20:00Z', invoice_id: 'INV-2024-002' },
  { id: '3', client_name: 'Big Company Ltd', site_name: 'erp.bigcompany.in', amount: 25000, status: 'pending', payment_method: 'Bank Transfer', paid_at: '2024-12-10T09:00:00Z', invoice_id: 'INV-2024-003' },
  { id: '4', client_name: 'Tech Solutions', site_name: 'erp.techsolutions.com', amount: 15000, status: 'failed', payment_method: 'Credit Card', paid_at: '2024-12-05T16:45:00Z', invoice_id: 'INV-2024-004' },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function getDaysUntil(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    expiring: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Expiring Soon' },
    overdue: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: 'Overdue' },
    suspended: { color: 'bg-red-100 text-red-700', icon: Ban, label: 'Suspended' },
    cancelled: { color: 'bg-gray-100 text-gray-500', icon: Ban, label: 'Cancelled' },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-700', icon: AlertTriangle, label: 'Failed' },
    refunded: { color: 'bg-gray-100 text-gray-500', icon: RefreshCw, label: 'Refunded' }
  }

  const c = config[status] || config.active
  const Icon = c.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {c.label}
    </span>
  )
}

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions)
  const [payments] = useState(mockPaymentHistory)
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments' | 'settings'>('subscriptions')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Calculate stats
  const stats = {
    totalMRR: subscriptions.filter(s => s.status === 'active' || s.status === 'expiring').reduce((acc, s) => {
      if (s.billing_cycle === 'yearly') return acc + (s.amount / 12)
      if (s.billing_cycle === 'quarterly') return acc + (s.amount / 3)
      return acc + s.amount
    }, 0),
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    expiringThisWeek: subscriptions.filter(s => {
      const days = getDaysUntil(s.expires_at)
      return days >= 0 && days <= 7
    }).length,
    overdue: subscriptions.filter(s => s.status === 'overdue').length,
    suspended: subscriptions.filter(s => s.status === 'suspended').length,
    pendingPayments: payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0)
  }

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      sub.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.site.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Actions
  const handleSendReminder = async (subId: string) => {
    setIsProcessing(subId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s, reminder_sent: true } : s
    ))
    setIsProcessing(null)
  }

  const handleSuspendSite = async (subId: string) => {
    setIsProcessing(subId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s, status: 'suspended' as const, site: { ...s.site, status: 'suspended' as const } } : s
    ))
    setIsProcessing(null)
  }

  const handleActivateSite = async (subId: string) => {
    setIsProcessing(subId)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s, status: 'active' as const, site: { ...s.site, status: 'active' as const } } : s
    ))
    setIsProcessing(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
          <p className="text-gray-500 mt-1">Manage subscriptions, payments, and auto-suspension</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <Link
            href="/dashboard/billing/invoices/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Monthly Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalMRR)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-green-600">{stats.activeSubscriptions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Expiring (7d)</p>
              <p className="text-xl font-bold text-yellow-600">{stats.expiringThisWeek}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Overdue</p>
              <p className="text-xl font-bold text-orange-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Suspended</p>
              <p className="text-xl font-bold text-red-600">{stats.suspended}</p>
            </div>
            <Ban className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.pendingPayments)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Auto-Suspension Settings
          </button>
        </div>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client, company, or site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="overdue">Overdue</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Subscription List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client / Site</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((sub) => {
                  const daysLeft = getDaysUntil(sub.expires_at)
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{sub.client.company}</p>
                          <p className="text-sm text-gray-500">{sub.site.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                          {sub.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{formatCurrency(sub.amount)}</p>
                        <p className="text-xs text-gray-500 capitalize">{sub.billing_cycle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(sub.expires_at)}</p>
                        <p className={`text-xs ${
                          daysLeft < 0 ? 'text-red-600 font-medium' :
                          daysLeft <= 3 ? 'text-orange-600' :
                          daysLeft <= 7 ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
                           daysLeft === 0 ? 'Expires today' :
                           `${daysLeft} days left`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!sub.reminder_sent && sub.status !== 'suspended' && (
                            <button
                              onClick={() => handleSendReminder(sub.id)}
                              disabled={isProcessing === sub.id}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                              title="Send Reminder"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status === 'suspended' ? (
                            <button
                              onClick={() => handleActivateSite(sub.id)}
                              disabled={isProcessing === sub.id}
                              className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50"
                            >
                              <Play className="w-3 h-3 inline mr-1" />
                              Activate
                            </button>
                          ) : sub.status === 'overdue' && (
                            <button
                              onClick={() => handleSuspendSite(sub.id)}
                              disabled={isProcessing === sub.id}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            >
                              <Pause className="w-3 h-3 inline mr-1" />
                              Suspend
                            </button>
                          )}
                          <Link
                            href={`/dashboard/sites/${sub.site.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            View Site
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">{payment.invoice_id}</td>
                  <td className="px-6 py-4 text-gray-900">{payment.client_name}</td>
                  <td className="px-6 py-4 text-gray-500">{payment.site_name}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-gray-500">{payment.payment_method}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(payment.paid_at)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Auto-Suspension Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Auto-Suspension Rules</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable Auto-Suspension</p>
                  <p className="text-sm text-gray-500">Automatically suspend sites when payment is overdue</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-gray-900 mb-2">Grace Period (days)</label>
                <p className="text-sm text-gray-500 mb-3">Number of days after expiry before auto-suspension</p>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="0">0 days (immediate)</option>
                  <option value="1">1 day</option>
                  <option value="3" selected>3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Send Reminder Emails</p>
                  <p className="text-sm text-gray-500">Notify clients before suspension</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-gray-900 mb-2">Reminder Schedule</label>
                <p className="text-sm text-gray-500 mb-3">When to send payment reminders</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">7 days before expiry</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">3 days before expiry</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">1 day before expiry</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">On expiry day</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Before suspension (final warning)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Auto-Delete After Suspension</p>
                  <p className="text-sm text-gray-500">Delete site data after prolonged suspension</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-gray-900 mb-2">Delete After (days)</label>
                <p className="text-sm text-gray-500 mb-3">Days after suspension before auto-deletion (if enabled)</p>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="30">30 days</option>
                  <option value="60" selected>60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Save Settings
              </button>
            </div>
          </div>

          {/* Notification Templates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h2>
            <div className="space-y-3">
              <Link href="/dashboard/settings/templates/reminder" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Payment Reminder</p>
                    <p className="text-sm text-gray-500">Sent before subscription expires</p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                </div>
              </Link>
              <Link href="/dashboard/settings/templates/suspension" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Suspension Notice</p>
                    <p className="text-sm text-gray-500">Sent when site is suspended</p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                </div>
              </Link>
              <Link href="/dashboard/settings/templates/reactivation" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Reactivation Confirmation</p>
                    <p className="text-sm text-gray-500">Sent when payment received</p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
