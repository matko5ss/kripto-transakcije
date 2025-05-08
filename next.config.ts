import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export to allow dynamic routes to work properly
  // output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out',
  // Comment out the exportPathMap to allow dynamic routes
  /*
  exportPathMap: async function() {
    return {
      '/': { page: '/' }
    };
  }
  */
};

export default nextConfig;
