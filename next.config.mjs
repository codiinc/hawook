/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['remark-gfm'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
