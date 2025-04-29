import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out',
  // Only generate the homepage for static export
  // This avoids issues with dynamic routes
  exportPathMap: async function() {
    return {
      '/': { page: '/' }
    };
  }
};

export default nextConfig;
