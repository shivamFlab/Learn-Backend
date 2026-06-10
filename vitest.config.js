import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.js"],
    // Mongoose models are registered on a single shared connection, so the
    // suites must not run in parallel against the same in-memory DB.
    fileParallelism: false,
    hookTimeout: 60000, // first run downloads the mongod binary
    testTimeout: 20000,
  },
});
