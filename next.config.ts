import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't infer it from an unrelated lockfile
  // elsewhere on the machine.
  turbopack: {
    root: path.join(__dirname),
  },
  // Keep the heavy Node-only report libraries out of the bundler; they run only
  // in the export route handler (Node runtime).
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
