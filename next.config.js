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
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  typescript: {
    // Don't fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
