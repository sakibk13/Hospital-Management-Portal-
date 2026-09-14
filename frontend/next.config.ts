import type { NextConfig } from "next";
import path from "path";

const getBackendOrigin = () => {
  const envUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return "http://localhost:5000";
  return envUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
};

const backendOrigin = getBackendOrigin();

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "react-helmet": "./src/utils/Helmet.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-helmet": path.resolve(__dirname, "src/utils/Helmet.js"),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
