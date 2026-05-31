import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://main-server:8989/openapi.json",
  output: "src/app/api/generated",
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    "@hey-api/sdk",
  ],
});
