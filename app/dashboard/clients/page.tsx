'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Globe,
  Edit,
  Trash2,
  Search
} from 'lucide-react'

// Mock data - replace with Supabase queries
const mockClients = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'Acme Corporation',
    email: 'rajesh@acmecorp.com',
    phone: '+91 98765 43210',
    sites_count: 2,
    plan: 'Professional',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'Big Company Ltd',
    email: 'priya@bigcompany.in',
    phone: '+91 98765 43211',
    sites_count: 1,
    plan: 'Starter',
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Amit Patel',
    company: 'Tech Solutions',
    email: 'amit@techsolutions.com',
    phone: '+91 98765 43212',
    sites_count: 3,
    plan: 'Enterprise',
    created_at: '2024-03-10T10:00:00Z'
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    company: 'StartupXYZ',
    email: 'sneha@startupxyz.com',
    phone: '+91 98765 43213',
    sites_count: 1,
    plan: 'Starter',
    created_at: '2024-04-05T10:00:00Z'
  }
]

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    Starter: 'bg-gray-100 text-gray-700',
    Professional: 'bg-blue-100 text-blue-700',
    Enterprise: 'bg-purple-100 text-purple-700'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[plan] || colors.Starter}`}>
      {plan}
    </span>
  )
}

export default function ClientsPage() {
  const [clients] = useState(mockClients)
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client information</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Starter Plan</p>
          <p className="text-2xl font-bold text-gray-600">
            {clients.filter(c => c.plan === 'Starter').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Professional</p>
          <p className="text-2xl font-bold text-blue-600">
            {clients.filter(c => c.plan === 'Professional').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Enterprise</p>
          <p className="text-2xl font-bold text-purple-600">
            {clients.filter(c => c.plan === 'Enterprise').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients by name, company, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sites
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-medium">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="w-3 h-3 mr-1" />
                        {client.company}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {client.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {client.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{client.sites_count} site{client.sites_count !== 1 ? 's' : ''}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <PlanBadge plan={client.plan} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === client.id ? null : client.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {openMenu === client.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        <Link
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Client
                        </Link>
                        <Link
                          href={`/dashboard/sites?client=${client.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          View Sites
                        </Link>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No clients found</p>
          </div>
        )}
      </div>
    </div>
  )
}
