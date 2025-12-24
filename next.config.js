/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['ssh2'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'ssh2': 'commonjs ssh2',
      })
    }
    return config
  },
}

module.exports = nextConfig
