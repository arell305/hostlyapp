import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["__tests__/backend/**/*.test.ts"],
    environment: "jsdom",
    server: { deps: { inline: ["convex-test"] } },
  },
});
