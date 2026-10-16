// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
  
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,          // helps catch potential issues early
  swcMinify: true,                // enables faster, smaller builds
  images: {
    domains: ["your-cdn.com"],    // allow Next/Image to optimize images from external domains
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental: {
    typedRoutes: true,            // optional: adds type safety to routes
  },
};

export default nextConfig;
