import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  reactStrictMode: true,
};
module.exports = {
  async rewrites() {
      return [
          {
              source: '/api/docs',
              destination: '/api/docs', 
          },
      ];
  },
};
module.exports = {
  experimental: {
      fontLoaders: [],
  },
};





export default nextConfig;
