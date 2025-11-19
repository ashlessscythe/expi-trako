/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Enable static optimization for better performance
  swcMinify: true,
  // Configure image domains if needed
  images: {
    domains: ["localhost"],
  },
  // Don't fail build on ESLint errors (warnings will still be shown)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
