'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Server,
  Globe,
  Package,
  Lock,
  CheckCircle,
  Loader2
} from 'lucide-react'

// Mock data - replace with Supabase queries
const mockServers = [
  {
    id: '1',
    name: 'Mumbai-1',
    location: 'Mumbai, India',
    ip: '192.168.1.10',
    sitesCount: 4,
    maxSites: 10,
    load: 45,
    status: 'active'
  },
  {
    id: '2',
    name: 'Singapore-1',
    location: 'Singapore',
    ip: '192.168.1.20',
    sitesCount: 3,
    maxSites: 15,
    load: 28,
    status: 'active'
  },
  {
    id: '3',
    name: 'Frankfurt-1',
    location: 'Frankfurt, Germany',
    ip: '192.168.1.30',
    sitesCount: 8,
    maxSites: 10,
    load: 72,
    status: 'active'
  }
]

const mockClients = [
  { id: '1', name: 'Acme Corporation', company: 'Acme Corp' },
  { id: '2', name: 'Big Company Ltd', company: 'Big Company' },
  { id: '3', name: 'New Startup Inc', company: 'New Startup' },
]

const availableApps = [
  // Core Apps
  { id: 'erpnext', name: 'ERPNext', description: 'Core ERP system with Accounting, Inventory, Sales, Purchase', required: true, category: 'core' },
  
  // Standard Apps
  { id: 'hrms', name: 'HRMS', description: 'Human Resource Management - Payroll, Attendance, Leaves', category: 'standard' },
  { id: 'payments', name: 'Payments', description: 'Payment gateway integration - Razorpay, Stripe, PayPal', category: 'standard' },
  { id: 'webshop', name: 'Webshop', description: 'E-commerce storefront with cart & checkout', category: 'standard' },
  { id: 'india_compliance', name: 'India Compliance', description: 'GST, e-Invoice, e-Waybill, TDS compliance', category: 'standard' },
  
  // Industry Apps
  { id: 'healthcare', name: 'Healthcare', description: 'Patient management, appointments, clinical records', category: 'industry' },
  { id: 'education', name: 'Education', description: 'Student management, fee collection, admissions', category: 'industry' },
  { id: 'lending', name: 'Lending', description: 'Loan management, EMI, disbursements', category: 'industry' },
  { id: 'hospitality', name: 'Hospitality', description: 'Hotel & restaurant management', category: 'industry' },
  { id: 'agriculture', name: 'Agriculture', description: 'Farm management, crop tracking', category: 'industry' },
  { id: 'non_profit', name: 'Non-Profit', description: 'Donor management, grants, memberships', category: 'industry' },
  
  // Productivity Apps
  { id: 'crm', name: 'CRM', description: 'Customer relationship management', category: 'productivity' },
  { id: 'helpdesk', name: 'Helpdesk', description: 'Customer support ticketing system', category: 'productivity' },
  { id: 'wiki', name: 'Wiki', description: 'Documentation and knowledge base', category: 'productivity' },
  { id: 'lms', name: 'LMS', description: 'Learning Management System for courses', category: 'productivity' },
  { id: 'gameplan', name: 'Gameplan', description: 'Project planning and team collaboration', category: 'productivity' },
  
  // Builder Apps
  { id: 'print_designer', name: 'Print Designer', description: 'Visual print format builder', category: 'builder' },
  { id: 'insights', name: 'Insights', description: 'Business intelligence & analytics', category: 'builder' },
  { id: 'builder', name: 'Builder', description: 'Visual website/page builder', category: 'builder' },
  { id: 'drive', name: 'Drive', description: 'Cloud file storage and sharing', category: 'builder' },
  
  // Custom Apps
  { id: 'Trustbit', name: 'Trustbit', description: 'Your custom app', category: 'custom' },
]

const appCategories = [
  { id: 'core', name: 'Core', description: 'Essential ERP modules' },
  { id: 'standard', name: 'Standard', description: 'Popular add-ons' },
  { id: 'industry', name: 'Industry', description: 'Vertical solutions' },
  { id: 'productivity', name: 'Productivity', description: 'Team tools' },
  { id: 'builder', name: 'Builder', description: 'Development tools' },
  { id: 'custom', name: 'Custom', description: 'Your apps' },
]

export default function NewSitePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  
  // Form state
  const [formData, setFormData] = useState({
    // Client info
    clientId: '',
    newClientName: '',
    newClientEmail: '',
    newClientCompany: '',
    isNewClient: false,
    
    // Site info
    domainType: 'subdomain' as 'subdomain' | 'custom',
    subdomain: '',
    customDomain: '',
    
    // Server selection
    serverId: '',
    
    // Apps
    apps: ['erpnext'] as string[],
    
    // Options
    setupSsl: true,
    enableScheduler: true,
  })

  const handleAppToggle = (appId: string) => {
    if (appId === 'erpnext') return // Cannot disable core app
    
    setFormData(prev => ({
      ...prev,
      apps: prev.apps.includes(appId)
        ? prev.apps.filter(a => a !== appId)
        : [...prev.apps, appId]
    }))
  }

  const getSiteName = () => {
    if (formData.domainType === 'custom') {
      return formData.customDomain
    }
    return formData.subdomain ? `${formData.subdomain}.yourdomain.com` : ''
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // TODO: Implement actual deployment logic
    // 1. Create client if new
    // 2. Create site record
    // 3. Trigger deployment job
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    router.push('/dashboard/sites')
  }

  const canProceedStep1 = () => {
    if (formData.isNewClient) {
      return formData.newClientName && formData.newClientEmail
    }
    return formData.clientId
  }

  const canProceedStep2 = () => {
    if (formData.domainType === 'subdomain') {
      return formData.subdomain && /^[a-z0-9-]+$/.test(formData.subdomain)
    }
    return formData.customDomain && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.customDomain)
  }

  const canProceedStep3 = () => {
    return formData.serverId
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/sites"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Sites
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Deploy New Site</h1>
        <p className="text-gray-500 mt-1">Create a new ERPNext site for your client</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Client' },
            { num: 2, label: 'Domain' },
            { num: 3, label: 'Server' },
            { num: 4, label: 'Apps' },
            { num: 5, label: 'Review' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > s.num
                    ? 'bg-green-500 text-white'
                    : step === s.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`ml-2 text-sm ${step === s.num ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 4 && (
                <div className={`w-12 h-0.5 mx-4 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1: Client Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Select or Create Client</h2>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFormData(prev => ({ ...prev, isNewClient: false }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  !formData.isNewClient
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                }`}
              >
                Existing Client
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, isNewClient: true }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  formData.isNewClient
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                }`}
              >
                New Client
              </button>
            </div>

            {!formData.isNewClient ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a client...</option>
                  {mockClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.newClientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, newClientName: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.newClientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, newClientEmail: e.target.value }))}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.newClientCompany}
                    onChange={(e) => setFormData(prev => ({ ...prev, newClientCompany: e.target.value }))}
                    placeholder="Company Ltd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Domain Configuration */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Configure Domain</h2>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFormData(prev => ({ ...prev, domainType: 'subdomain' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  formData.domainType === 'subdomain'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                }`}
              >
                Use Subdomain
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, domainType: 'custom' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  formData.domainType === 'custom'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                }`}
              >
                Custom Domain
              </button>
            </div>

            {formData.domainType === 'subdomain' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    }))}
                    placeholder="clientname"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                    .yourdomain.com
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <input
                  type="text"
                  value={formData.customDomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value.toLowerCase() }))}
                  placeholder="erp.clientdomain.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>DNS Setup Required:</strong> Point an A record to your selected server's IP address.
                    SSL will be configured automatically after DNS propagation.
                  </p>
                </div>
              </div>
            )}

            {getSiteName() && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Site URL:</strong> https://{getSiteName()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Server Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Server</h2>
            
            <div className="space-y-4">
              {mockServers.map(server => (
                <div
                  key={server.id}
                  onClick={() => setFormData(prev => ({ ...prev, serverId: server.id }))}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.serverId === server.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Server className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{server.name}</p>
                        <p className="text-sm text-gray-500">{server.location} • {server.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              server.load > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${server.load}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{server.load}%</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {server.sitesCount}/{server.maxSites} sites
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: App Selection */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Apps to Install</h2>
            <p className="text-gray-500">Choose the apps to install on this site. ERPNext is required.</p>
            
            {appCategories.map(category => {
              const categoryApps = availableApps.filter(app => app.category === category.id)
              if (categoryApps.length === 0) return null
              
              return (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">{category.description}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryApps.map(app => (
                      <div
                        key={app.id}
                        onClick={() => handleAppToggle(app.id)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.apps.includes(app.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${app.required ? 'opacity-90' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              formData.apps.includes(app.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {formData.apps.includes(app.id) && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {app.name}
                                {app.required && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Required</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">{app.description}</p>
                            </div>
                          </div>
                          <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected Apps ({formData.apps.length}):</strong>{' '}
                {formData.apps.map(appId => availableApps.find(a => a.id === appId)?.name).join(', ')}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="font-medium text-gray-900">Additional Options</h3>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.setupSsl}
                  onChange={(e) => setFormData(prev => ({ ...prev, setupSsl: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">Setup SSL Certificate (HTTPS)</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableScheduler}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableScheduler: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Enable Background Scheduler</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review & Deploy</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
                <p className="text-gray-900">
                  {formData.isNewClient 
                    ? `${formData.newClientName} (${formData.newClientEmail})`
                    : mockClients.find(c => c.id === formData.clientId)?.name
                  }
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Site Domain</h3>
                <p className="text-gray-900">{getSiteName()}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Server</h3>
                <p className="text-gray-900">
                  {mockServers.find(s => s.id === formData.serverId)?.name} 
                  ({mockServers.find(s => s.id === formData.serverId)?.ip})
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Apps</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.apps.map(appId => (
                    <span key={appId} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      {availableApps.find(a => a.id === appId)?.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Options</h3>
                <ul className="text-gray-900 space-y-1">
                  <li>• SSL: {formData.setupSsl ? 'Yes' : 'No'}</li>
                  <li>• Scheduler: {formData.enableScheduler ? 'Enabled' : 'Disabled'}</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Deployment typically takes 5-10 minutes. 
                You will receive credentials once the site is ready.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              disabled={
                (step === 1 && !canProceedStep1()) ||
                (step === 2 && !canProceedStep2()) ||
                (step === 3 && !canProceedStep3())
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                'Deploy Site'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
