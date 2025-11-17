/** @type {import('next').NextConfig} */
const path = require("path");
const fs = require("fs");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/**
 * Auto-detect the Next app root directory.
 * Candidate order:
 *  - ./hostlyapp
 *  - ./hostlyapp/hostlyapp
 *  - ./ (the current directory)
 *  - ../ (one level up, in weird cases)
 *
 * It returns an absolute path that contains package.json AND either an `app` or `pages` folder.
 * Fallback is __dirname (absolute).
 */
function findNextAppRoot() {
  const candidates = [
    path.resolve(__dirname, "hostlyapp"),
    path.resolve(__dirname, "hostlyapp", "hostlyapp"),
    path.resolve(__dirname),
    path.resolve(__dirname, ".."),
  ];

  for (const candidate of candidates) {
    try {
      const hasPackageJson = fs.existsSync(
        path.join(candidate, "package.json")
      );
      const hasAppOrPages =
        fs.existsSync(path.join(candidate, "app")) ||
        fs.existsSync(path.join(candidate, "pages")) ||
        fs.existsSync(path.join(candidate, "next.config.js"));
      if (hasPackageJson && hasAppOrPages) {
        return candidate;
      }
    } catch (e) {
      // ignore and try next
    }
  }

  // Last resort: return absolute __dirname
  return path.resolve(__dirname);
}

const detectedRoot = findNextAppRoot();

// debug output (will show when Next prints config) — remove if you prefer silent
console.log("Turbopack: using detected Next app root:", detectedRoot);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_CONVEX_DOMAIN ||
          "oceanic-tapir-499.convex.cloud",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // turbopack.root must be absolute. We set it to the detected absolute app root.
  turbopack: {
    root: detectedRoot,
  },

  // optional: if you want to explicitly set distDir relative to detectedRoot,
  // uncomment the line below. Usually not necessary if root is correct.
  // distDir: path.relative(detectedRoot, path.join(detectedRoot, ".next")),
};

module.exports = withPWA(nextConfig);
