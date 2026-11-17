import { defineConfig, mergeConfig } from "vitest/config";
import base from "./vitest.config.mjs";

/** Tests d'intégration : base PostgreSQL dédiée (TEST_DATABASE_URL), jamais la base de dev. */
export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: ["tests/integration/**/*.test.ts"],
      fileParallelism: false,
      setupFiles: ["tests/integration/setup.ts"],
      testTimeout: 20_000,
    },
  }),
);
