import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'olive-banks-join.loca.lt', 
    'deep-worlds-fix.loca.lt',
    'three-stars-attack.loca.lt' //Add this new one here
  ],
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;