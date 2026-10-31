import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
  // Extend proxy timeout to 150s so rewrites wait long enough for Gemma 4 analysis
  experimental: {
    proxyTimeout: 150000,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;

    // BACKEND_URL must be a fully-qualified http(s) URL (e.g. https://xxx.up.railway.app)
    // Local dev default: http://localhost:3001
    // Vercel / production: set BACKEND_URL env var in your deployment dashboard
    const resolvedUrl =
      typeof backendUrl === "string" &&
      (backendUrl.startsWith("http://") || backendUrl.startsWith("https://"))
        ? backendUrl
        : process.env.NODE_ENV === "production"
          ? null            // skip rewrite in production if URL not configured
          : "http://localhost:3001"; // local dev fallback

    if (!resolvedUrl) {
      console.warn(
        "[next.config] BACKEND_URL is not set. /api/* requests will not be proxied. " +
        "Set BACKEND_URL=https://your-backend.up.railway.app in Vercel environment variables."
      );
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${resolvedUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
