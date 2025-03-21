import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!convex-test).+\\.js$"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testMatch: ["<rootDir>/__tests__/frontend/**/*.test.{js,jsx,ts,tsx}"],
};

export default createJestConfig(config);
