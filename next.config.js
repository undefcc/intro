/** @type {import('next').NextConfig} */
const cl = require('next-contentlayer')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',

  // 允许外部截图服务的图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.screenshotone.com',
      },
      {
        protocol: 'https',
        hostname: 'shot.screenshotapi.net',
      },
      {
        protocol: 'https',
        hostname: 'api.apiflash.com',
      },
    ],
  },

  // // 优化构建
  // swcMinify: true,
  // compress: true,

  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
    ];
  },
}

module.exports = cl.withContentlayer(nextConfig)
