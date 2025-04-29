import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '',
  trailingSlash: true,
  // Specify the output directory for static export
  distDir: 'out',
};

export default nextConfig;
