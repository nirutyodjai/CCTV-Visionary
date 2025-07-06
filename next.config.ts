import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  onunhandledrejection: (err) => { console.error(err); return false; },
  devIndicators: {
    buildActivity: false
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https'
        ,
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
