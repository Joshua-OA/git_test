/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove basePath since we're using a subdomain now
  // basePath: '/emr',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'luxeclinicgh.com', 'emr.luxeclinicgh.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'luxeclinicgh.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'emr.luxeclinicgh.com',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
