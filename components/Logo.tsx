import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  href?: string
  className?: string
}

const sizes = {
  sm: { icon: 'w-8 h-8', text: 'text-lg', iconText: 'text-xs' },
  md: { icon: 'w-10 h-10', text: 'text-xl', iconText: 'text-sm' },
  lg: { icon: 'w-12 h-12', text: 'text-2xl', iconText: 'text-base' },
  xl: { icon: 'w-16 h-16', text: 'text-3xl', iconText: 'text-xl' },
}

export function Logo({ size = 'md', showText = true, href, className = '' }: LogoProps) {
  const { icon, text, iconText } = sizes[size]

  const content = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${icon} bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <span className={`text-white font-bold ${iconText}`}>RO</span>
      </div>
      {showText && (
        <div className="flex">
          <span className={`${text} font-bold text-gray-900`}>Rahul</span>
          <span className={`${text} font-bold text-indigo-600`}>Ops</span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

export function LogoIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}>
      <span className="text-white font-bold">RO</span>
    </div>
  )
}

export function LogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">RO</span>
      </div>
      <div>
        <div className="flex">
          <span className="text-2xl font-bold text-gray-900">Rahul</span>
          <span className="text-2xl font-bold text-indigo-600">Ops</span>
        </div>
        <p className="text-xs text-gray-500">ERPNext Deployment Platform</p>
      </div>
    </div>
  )
}

export default Logo
