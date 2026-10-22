const backendApiUrl = process.env.API_INTERNAL_URL
  || process.env.NEXT_PUBLIC_API_URL
  || 'http://localhost:8000/api';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
