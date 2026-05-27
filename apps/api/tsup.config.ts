import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: [/(^@repo.*)/], // transpile packages starting with `@repo` and their dependencies
  external: ["bcrypt", "mock-aws-s3", "aws-sdk", "nock", "@mapbox/node-pre-gyp"],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
});
