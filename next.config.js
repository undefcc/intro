/** @type {import('next').NextConfig} */
const cl = require('next-contentlayer')

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // output: 'standalone',

  // // 优化构建
  // swcMinify: true,
  // compress: true,

  // async headers() {
  //   return [
  //     {
  //       source: '/:path*{/}?',
  //       headers: [
  //         {
  //           key: 'X-Accel-Buffering',
  //           value: 'no',
  //         },
  //       ],
  //     },
  //   ];
  // },
}

module.exports = nextConfig
