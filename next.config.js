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
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'sn-uploads.global.ssl.fastly.net',
      },
      {
        protocol: 'https',
        hostname: 'www.siennanaturals.com',
      },
      {
        protocol: 'https',
        hostname: 'siennanaturals.com',
      },
    ],
  },
  // Add experimental configuration to skip prerendering
  experimental: {
    unstable_excludeFiles: ['/app/training/page.jsx'], // Path relative to the project root
  },
};

module.exports = nextConfig;