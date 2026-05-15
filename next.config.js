/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "neki-uploads.s3.us-east-1.amazonaws.com",
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
