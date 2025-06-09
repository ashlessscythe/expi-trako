/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable static optimization for better performance
  swcMinify: true,
  // Configure image domains if needed
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
