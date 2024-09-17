import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./", // Path to your Next.js app
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest", // Transform TypeScript files using babel-jest
    "^.+\\.(js|jsx)$": "babel-jest", // Transform JavaScript files using babel-jest
  },
  transformIgnorePatterns: [
    "/node_modules/(?!convex-test).+\\.js$", // Transform specific node_modules
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  // Add this if you need to handle ECMAScript modules
  // moduleNameMapper: {
  //   "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  // },
  testMatch: ["<rootDir>/__tests__/frontend/**/*.test.{js,jsx,ts,tsx}"],
};

export default createJestConfig(config);
