import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Increase payload limit for multiple image uploads via Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // @ts-expect-error next-env doesn't type this properly in all versions
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'medical-outreach-data-cdbh.vercel.app',
      },
      {
        protocol: 'http',
        hostname: 'medical-outreach-data-cdbh.vercel.app',
      },
    ],
  },

  // ─── OWASP: Security Headers ─────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to every route
        source: '/(.*)',
        headers: [
          // Clickjacking protection — blocks ALL iframe embedding
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevents browser from MIME-sniffing a response away from declared Content-Type
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // HSTS — forces HTTPS for 2 years, including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Controls what info the Referer header leaks to other sites
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restricts browser features (camera, mic, geolocation, etc.)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy — tailored whitelist for ReachPoint
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.paystack.co https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://medical-outreach-data-cdbh.vercel.app",
              "connect-src 'self' https://*.pusher.com wss://*.pusher.com https://challenges.cloudflare.com https://api.paystack.co https://api.cloudinary.com https://va.vercel-scripts.com",
              "frame-src https://challenges.cloudflare.com https://js.paystack.co",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
