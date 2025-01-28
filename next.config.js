/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimizations
  compiler: {
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Progressive Web App
  experimental: {
    optimizeFonts: true,
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
}

module.exports = nextConfig
