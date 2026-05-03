import type { NextConfig } from 'next'

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.BACKEND_URL ??
  'http://127.0.0.1:8000'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['next-chessground'],
  output: 'standalone',
  /** Next 16: явно помечаем Turbopack, пока сборка через webpack (--webpack в npm scripts). */
  turbopack: {},
  async rewrites() {
    const useRewrite =
      process.env.NEXT_PUBLIC_USE_API_REWRITE === '1' ||
      process.env.NODE_ENV !== 'production'
    if (!useRewrite) return []
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
      { source: '/health', destination: `${backendUrl.replace(/\/$/, '')}/health` },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false }
    return config
  },
}

export default config
