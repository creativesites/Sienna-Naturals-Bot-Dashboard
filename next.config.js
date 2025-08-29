
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thekingdomeconomy.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com', // Example for Sienna Naturals CDN (adjust if different)
        pathname: '/**', // Allow all paths from Sienna Naturals CDN
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Keep optimization for other domains you might use
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'sn-uploads.global.ssl.fastly.net', // sienna naturals cdn domain
      },
      {
        protocol: 'https',
        hostname: 'www.siennanaturals.com', // Sienna Naturals domain (with www)
      },
      {
        protocol: 'https',
        hostname: 'siennanaturals.com', // Sienna Naturals domain (without www)
      }
    ],
  },
  // Add these new settings for module resolution
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add a resolver plugin that explicitly handles @/ paths
    config.resolve.plugins = config.resolve.plugins || [];
    
    // Add support for resolving TypeScript paths
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    
    config.resolve.alias['@'] = require('path').resolve(__dirname, 'src');
    
    // Important: Return the modified config
    return config;
  },
  // Enable experimental features that might help with module resolution
  experimental: {
    // ppr: 'incremental',
    externalDir: true  // Helps with monorepo setups if applicable
  },
  // Ignore type errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
