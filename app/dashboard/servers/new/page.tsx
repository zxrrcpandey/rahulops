'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Server,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'

export default function NewServerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSshKey, setShowSshKey] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ip_address: '',
    ssh_port: '22',
    ssh_user: 'root',
    ssh_private_key: '',
    mariadb_root_password: '',
    total_ram_gb: '',
    total_cpu_cores: '',
    total_disk_gb: '',
    max_sites: '10',
    bench_already_installed: false
  })

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    // TODO: Implement actual SSH connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock result
    const success = Math.random() > 0.3
    setTestResult(success ? 'success' : 'error')
    setTestMessage(success 
      ? 'Connection successful! Server is reachable.' 
      : 'Connection failed. Please check IP address and SSH credentials.'
    )
    setIsTesting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Implement actual server creation
    // 1. Save server to Supabase
    // 2. If not already installed, trigger setup job
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    router.push('/dashboard/servers')
  }

  const isFormValid = () => {
    return (
      formData.name &&
      formData.ip_address &&
      formData.ssh_user &&
      formData.ssh_private_key
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/servers"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Servers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Server</h1>
        <p className="text-gray-500 mt-1">Register a new Hostinger VPS server for multi-tenant deployment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-600" />
            Server Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Server Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mumbai-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Mumbai, India"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address *
              </label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                placeholder="e.g., 103.152.xxx.xxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SSH Port
              </label>
              <input
                type="number"
                value={formData.ssh_port}
                onChange={(e) => setFormData(prev => ({ ...prev, ssh_port: e.target.value }))}
                placeholder="22"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SSH Credentials */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2 text-green-600" />
            SSH Credentials
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SSH Username *
              </label>
              <input
                type="text"
                value={formData.ssh_user}
                onChange={(e) => setFormData(prev => ({ ...prev, ssh_user: e.target.value }))}
                placeholder="root"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use 'root' for initial setup. A 'frappe' user will be created automatically.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SSH Private Key *
              </label>
              <div className="relative">
                <textarea
                  value={formData.ssh_private_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, ssh_private_key: e.target.value }))}
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                  rows={6}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                    !showSshKey ? 'text-security-disc' : ''
                  }`}
                  style={!showSshKey ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : {}}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSshKey(!showSshKey)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showSshKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste your private key. It will be encrypted before storage.
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={!formData.ip_address || !formData.ssh_private_key || isTesting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </button>
              
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg flex items-center ${
                  testResult === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {testResult === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  {testMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Server Resources */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Server Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RAM (GB)
              </label>
              <input
                type="number"
                value={formData.total_ram_gb}
                onChange={(e) => setFormData(prev => ({ ...prev, total_ram_gb: e.target.value }))}
                placeholder="16"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPU Cores
              </label>
              <input
                type="number"
                value={formData.total_cpu_cores}
                onChange={(e) => setFormData(prev => ({ ...prev, total_cpu_cores: e.target.value }))}
                placeholder="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disk (GB)
              </label>
              <input
                type="number"
                value={formData.total_disk_gb}
                onChange={(e) => setFormData(prev => ({ ...prev, total_disk_gb: e.target.value }))}
                placeholder="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Sites
              </label>
              <input
                type="number"
                value={formData.max_sites}
                onChange={(e) => setFormData(prev => ({ ...prev, max_sites: e.target.value }))}
                placeholder="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Database Credentials */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Database Credentials
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MariaDB Root Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.mariadb_root_password}
                onChange={(e) => setFormData(prev => ({ ...prev, mariadb_root_password: e.target.value }))}
                placeholder="Leave empty to auto-generate during setup"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              If left empty, a secure password will be generated during server setup.
            </p>
          </div>
        </div>

        {/* Setup Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Setup Options
          </h2>
          
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.bench_already_installed}
              onChange={(e) => setFormData(prev => ({ ...prev, bench_already_installed: e.target.checked }))}
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-900 font-medium">Frappe Bench is already installed</span>
              <p className="text-sm text-gray-500">
                Check this if the server already has Frappe Bench configured. 
                Otherwise, we'll run the full setup script.
              </p>
            </div>
          </label>

          {!formData.bench_already_installed && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Server Setup Will Be Required
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    After adding the server, you'll need to run the one-time setup script.
                    This will install Frappe Bench with all required apps (ERPNext, HRMS, Payments, etc.)
                    and typically takes 20-30 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/dashboard/servers"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Server...
              </>
            ) : (
              <>
                <Server className="w-4 h-4 mr-2" />
                Add Server
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
