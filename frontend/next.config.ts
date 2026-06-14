import type { NextConfig } from "next";

const backendApiUrl = process.env.API_INTERNAL_URL
  || process.env.NEXT_PUBLIC_API_URL
  || 'http://localhost:8000/api';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/frilo/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
