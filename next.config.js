/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizations
  compiler: {
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Image optimization
  images: {
    domains: ['i.scdn.co'], // Allow Spotify image domains
    formats: ['image/avif', 'image/webp'],
  },
  // Progressive Web App
  experimental: {
    scrollRestoration: true,
  },
  // Disable X-Powered-By header
  poweredByHeader: false,
  // Enable source maps in development
  productionBrowserSourceMaps: process.env.NODE_ENV !== 'production',
  // Custom webpack config
  webpack: (config, { dev, isServer }) => {
    // Optimization for production builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  },
}

module.exports = nextConfig
