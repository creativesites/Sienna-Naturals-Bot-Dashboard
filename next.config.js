/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [ // Use remotePatterns for more control
      {
        protocol: 'https',
        hostname: 'thekingdomeconomy.com',
        pathname: '/wp-content/uploads/**', // Allow all paths under /wp-content/uploads/
        //unoptimized: true, // Disable optimization for these images from this domain
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
};

module.exports = nextConfig;