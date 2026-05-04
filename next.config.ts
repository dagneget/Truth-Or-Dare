import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});


const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.56.1:3000", "10.18.51.42:3000", "192.168.137.1:3000", "localhost:3000"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {},
};





export default withPWA(nextConfig);

