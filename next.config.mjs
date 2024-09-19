/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Determine if we are in production
    const isProduction = process.env.NODE_ENV === "production";

    // Only apply redirects if in production
    if (isProduction) {
      return [
        {
          source: "/dashboard",
          destination: "https://dashboard.hostlyapp.com",
          permanent: false, // Set to `true` if this redirect should be permanent
        },
        {
          source: "/analytics",
          destination: "https://dashboard.hostlyapp.com/analytics",
          permanent: false, // Set to `true` if this redirect should be permanent
        },
      ];
    }

    // In development, no redirects are set
    return [];
  },
};

export default nextConfig;
